/**
 * Transactions Routes
 *
 * WARNING: This file contains Bug #3 (incorrect balance calculation)
 * and Bug #5 (race condition in concurrent transactions)
 *
 * TODO: Complete the implementation as described in INSTRUCTIONS.md
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// Simple lock mechanism for preventing race conditions
// BUG #5: This is not implemented! Concurrent transactions can cause issues
const accountLocks = new Map();

/**
 * Acquire a lock on an account
 * Returns true if lock acquired, false if already locked
 */
function acquireLock(compteId) {
  // TODO: Fix Bug #5 - Implement proper locking
  // Currently this doesn't actually prevent race conditions
  // Hint: Check if lock exists, if not create it, if exists return false
  if (accountLocks.has(compteId)) {
    return false;
  }
  accountLocks.set(compteId, true);
  return true;
}

/**
 * Release a lock on an account
 */
function releaseLock(compteId) {
  // TODO: Fix Bug #5 - Implement proper lock release
  // Hint: Remove the lock from the accountLocks map
  accountLocks.delete(compteId);
}

/**
 * Validation helper for transaction data
 */
function validateTransactionData(data) {
  const errors = [];

  // Validate montant
  if (!data.montant || typeof data.montant !== 'number') {
    errors.push('Le montant est obligatoire et doit être un nombre');
  } else if (data.montant < 100) {
    errors.push('Le montant minimum est de 100 XOF');
  } else if (data.montant <= 0) {
    errors.push('Le montant doit être positif');
  }

  // Validate description
  if (data.description && data.description.length > 200) {
    errors.push('La description ne peut pas dépasser 200 caractères');
  }

  return errors;
}

/**
 * Update account balance
 * BUG #3: The balance calculation is incorrect!
 */
function updateAccountBalance(compteId, montant, isCredit) {
  const compte = db.findById('comptes', compteId);

  if (!compte) {
    throw new Error('Compte non trouvé');
  }

  // BUG #3: This calculation is wrong!
  // It should add for credits and subtract for debits
  // But currently it does the opposite!
  let newSolde;
  if (isCredit) {
    newSolde = compte.solde + montant; // Wrong! Should be +
  } else {
    newSolde = compte.solde - montant; // Wrong! Should be -
  }

  db.updateInCollection('comptes', compteId, { solde: newSolde });

  return newSolde;
}

/**
 * POST /api/transactions/depot
 * Make a deposit to an account
 */
router.post('/depot', (req, res) => {
  // TODO: Implement this endpoint
  // Steps:
  // 1. Validate data
  // 2. Check account exists and is active
  // 3. Acquire lock on account
  // 4. Update balance
  // 5. Create transaction record
  // 6. Release lock
  // 7. Return the transaction

  try {
    const { compteId, montant, description } = req.body;

    // Validate
    const errors = validateTransactionData(req.body);
    if (!compteId) errors.push('L\'ID du compte est obligatoire');

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Check account
    const compte = db.findById('comptes', compteId);
    if (!compte) {
      return res.status(404).json({
        error: true,
        message: 'Compte non trouvé',
        code: 'COMPTE_NOT_FOUND'
      });
    }

    if (compte.statut !== 'actif') {
      return res.status(400).json({
        error: true,
        message: 'Le compte doit être actif',
        code: 'COMPTE_INACTIVE'
      });
    }

    // Acquire lock
    if (!acquireLock(compteId)) {
      return res.status(409).json({
        error: true,
        message: 'Une transaction est déjà en cours sur ce compte',
        code: 'ACCOUNT_LOCKED'
      });
    }

    try {
      // Update balance (isCredit = true for deposits)
      const newSolde = updateAccountBalance(compteId, montant, true);

      // Create transaction
      const transaction = {
        id: uuidv4(),
        compteId,
        type: 'depot',
        montant,
        devise: 'XOF',
        description: description || 'Dépôt',
        dateTransaction: new Date().toISOString(),
        statut: 'reussie'
      };

      db.addToCollection('transactions', transaction);

      res.status(201).json({
        success: true,
        data: transaction,
        nouveauSolde: newSolde
      });
    } finally {
      releaseLock(compteId);
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/transactions/retrait
 * Make a withdrawal from an account
 */
router.post('/retrait', (req, res) => {
  // TODO: Implement this endpoint
  // Similar to depot but:
  // - Check sufficient balance before withdrawing
  // - Use isCredit = false

  try {
    const { compteId, montant, description } = req.body;

    // Validate
    const errors = validateTransactionData(req.body);
    if (!compteId) errors.push('L\'ID du compte est obligatoire');

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Check account
    const compte = db.findById('comptes', compteId);
    if (!compte) {
      return res.status(404).json({
        error: true,
        message: 'Compte non trouvé',
        code: 'COMPTE_NOT_FOUND'
      });
    }

    if (compte.statut !== 'actif') {
      return res.status(400).json({
        error: true,
        message: 'Le compte doit être actif',
        code: 'COMPTE_INACTIVE'
      });
    }

    // Check sufficient balance
    if (compte.solde < montant) {
      return res.status(400).json({
        error: true,
        message: 'Solde insuffisant',
        code: 'INSUFFICIENT_BALANCE',
        details: {
          soldeActuel: compte.solde,
          montantDemande: montant
        }
      });
    }

    // Acquire lock
    if (!acquireLock(compteId)) {
      return res.status(409).json({
        error: true,
        message: 'Une transaction est déjà en cours sur ce compte',
        code: 'ACCOUNT_LOCKED'
      });
    }

    try {
      // Update balance (isCredit = false for withdrawals)
      const newSolde = updateAccountBalance(compteId, montant, false);

      // Create transaction
      const transaction = {
        id: uuidv4(),
        compteId,
        type: 'retrait',
        montant,
        devise: 'XOF',
        description: description || 'Retrait',
        dateTransaction: new Date().toISOString(),
        statut: 'reussie'
      };

      db.addToCollection('transactions', transaction);

      res.status(201).json({
        success: true,
        data: transaction,
        nouveauSolde: newSolde
      });
    } finally {
      releaseLock(compteId);
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/transactions/transfert
 * Transfer money between two accounts
 */
router.post('/transfert', (req, res) => {
  // TODO: Implement this endpoint
  // This is more complex:
  // 1. Validate both accounts exist and are active
  // 2. Check they are different
  // 3. Check sufficient balance in source account
  // 4. Acquire locks on BOTH accounts (be careful with deadlocks!)
  // 5. Debit source account
  // 6. Credit destination account
  // 7. Create two transaction records
  // 8. Release both locks
  // 9. Return both transactions

  try {
    const { compteSourceId, compteDestinataireId, montant, description } = req.body;

    // Validate
    const errors = validateTransactionData(req.body);
    if (!compteSourceId) errors.push('L\'ID du compte source est obligatoire');
    if (!compteDestinataireId) errors.push('L\'ID du compte destinataire est obligatoire');

    if (compteSourceId === compteDestinataireId) {
      errors.push('Les comptes source et destinataire doivent être différents');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Check both accounts
    const compteSource = db.findById('comptes', compteSourceId);
    const compteDestinataire = db.findById('comptes', compteDestinataireId);

    if (!compteSource) {
      return res.status(404).json({
        error: true,
        message: 'Compte source non trouvé',
        code: 'SOURCE_COMPTE_NOT_FOUND'
      });
    }

    if (!compteDestinataire) {
      return res.status(404).json({
        error: true,
        message: 'Compte destinataire non trouvé',
        code: 'DEST_COMPTE_NOT_FOUND'
      });
    }

    if (compteSource.statut !== 'actif') {
      return res.status(400).json({
        error: true,
        message: 'Le compte source doit être actif',
        code: 'SOURCE_COMPTE_INACTIVE'
      });
    }

    if (compteDestinataire.statut !== 'actif') {
      return res.status(400).json({
        error: true,
        message: 'Le compte destinataire doit être actif',
        code: 'DEST_COMPTE_INACTIVE'
      });
    }

    // Check balance
    if (compteSource.solde < montant) {
      return res.status(400).json({
        error: true,
        message: 'Solde insuffisant',
        code: 'INSUFFICIENT_BALANCE',
        details: {
          soldeActuel: compteSource.solde,
          montantDemande: montant
        }
      });
    }

    // Acquire locks (always in the same order to prevent deadlocks)
    const [first, second] = [compteSourceId, compteDestinataireId].sort();

    if (!acquireLock(first)) {
      return res.status(409).json({
        error: true,
        message: 'Une transaction est déjà en cours',
        code: 'ACCOUNT_LOCKED'
      });
    }

    if (!acquireLock(second)) {
      releaseLock(first);
      return res.status(409).json({
        error: true,
        message: 'Une transaction est déjà en cours',
        code: 'ACCOUNT_LOCKED'
      });
    }

    try {
      // Debit source
      const newSoldeSource = updateAccountBalance(compteSourceId, montant, false);

      // Credit destination
      const newSoldeDestinataire = updateAccountBalance(compteDestinataireId, montant, true);

      // Create transactions
      const transactionDebit = {
        id: uuidv4(),
        compteId: compteSourceId,
        type: 'transfert',
        montant: -montant, // Negative for debit
        devise: 'XOF',
        description: description || `Transfert vers ${compteDestinataire.numeroCompte}`,
        dateTransaction: new Date().toISOString(),
        compteDestinataireId,
        statut: 'reussie'
      };

      const transactionCredit = {
        id: uuidv4(),
        compteId: compteDestinataireId,
        type: 'transfert',
        montant: montant, // Positive for credit
        devise: 'XOF',
        description: description || `Transfert de ${compteSource.numeroCompte}`,
        dateTransaction: new Date().toISOString(),
        compteSourceId,
        statut: 'reussie'
      };

      db.addToCollection('transactions', transactionDebit);
      db.addToCollection('transactions', transactionCredit);

      res.status(201).json({
        success: true,
        data: {
          debit: transactionDebit,
          credit: transactionCredit
        },
        nouveauSoldeSource: newSoldeSource,
        nouveauSoldeDestinataire: newSoldeDestinataire
      });
    } finally {
      releaseLock(first);
      releaseLock(second);
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/transactions/compte/:compteId
 * Get transaction history for an account
 */
router.get('/compte/:compteId', (req, res) => {
  // TODO: Implement this endpoint
  // Support query parameter ?limit=X (default 50)
  // Sort by date descending (newest first)

  try {
    const { compteId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Check account exists
    const compte = db.findById('comptes', compteId);
    if (!compte) {
      return res.status(404).json({
        error: true,
        message: 'Compte non trouvé',
        code: 'COMPTE_NOT_FOUND'
      });
    }

    // Get transactions
    let transactions = db.findInCollection('transactions', t => t.compteId === compteId);

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.dateTransaction) - new Date(a.dateTransaction));

    // Limit results
    transactions = transactions.slice(0, limit);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
router.get('/:id', (req, res) => {
  // TODO: Implement this endpoint

  try {
    const transaction = db.findById('transactions', req.params.id);

    if (!transaction) {
      return res.status(404).json({
        error: true,
        message: 'Transaction non trouvée',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
