/**
 * Comptes (Accounts) Routes
 *
 * TODO: Complete the implementation as described in INSTRUCTIONS.md
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

/**
 * Validation helper for compte data
 */
function validateCompteData(data) {
  const errors = [];

  // Validate client exists
  if (!data.clientId) {
    errors.push('L\'ID du client est obligatoire');
  } else {
    const client = db.findById('clients', data.clientId);
    if (!client) {
      errors.push('Le client spécifié n\'existe pas');
    } else if (client.statut !== 'actif') {
      errors.push('Le client doit être actif pour ouvrir un compte');
    }
  }

  // Validate type
  if (data.type && !['epargne', 'courant'].includes(data.type)) {
    errors.push('Le type de compte doit être "epargne" ou "courant"');
  }

  return errors;
}

/**
 * POST /api/comptes
 * Create a new account for a client
 */
router.post('/', (req, res) => {
  // TODO: Implement this endpoint
  // Steps:
  // 1. Validate the request body
  // 2. Generate a unique account number using db.generateNumeroCompte()
  // 3. Create account with initial balance of 0
  // 4. Add to database
  // 5. Return 201 with the created account

  try {
    const errors = validateCompteData(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    const newCompte = {
      id: uuidv4(),
      clientId: req.body.clientId,
      numeroCompte: db.generateNumeroCompte(),
      solde: 0,
      devise: 'XOF',
      type: req.body.type || 'epargne',
      dateOuverture: new Date().toISOString(),
      statut: 'actif'
    };

    db.addToCollection('comptes', newCompte);

    res.status(201).json({
      success: true,
      data: newCompte
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
 * GET /api/comptes/client/:clientId
 * Get all accounts for a specific client
 */
router.get('/client/:clientId', (req, res) => {
  // TODO: Implement this endpoint
  // Hint: Use db.findInCollection() to filter by clientId

  try {
    const comptes = db.findInCollection('comptes', c => c.clientId === req.params.clientId);

    res.json({
      success: true,
      data: comptes,
      count: comptes.length
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
 * GET /api/comptes/:id
 * Get a single account by ID
 */
router.get('/:id', (req, res) => {
  // TODO: Implement this endpoint

  try {
    const compte = db.findById('comptes', req.params.id);

    if (!compte) {
      return res.status(404).json({
        error: true,
        message: 'Compte non trouvé',
        code: 'COMPTE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: compte
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
 * PUT /api/comptes/:id/statut
 * Update account status (activate/deactivate)
 */
router.put('/:id/statut', (req, res) => {
  // TODO: Implement this endpoint
  // Important: An account can only be closed if balance is 0

  try {
    const compte = db.findById('comptes', req.params.id);

    if (!compte) {
      return res.status(404).json({
        error: true,
        message: 'Compte non trouvé',
        code: 'COMPTE_NOT_FOUND'
      });
    }

    const { statut } = req.body;

    if (!statut || !['actif', 'fermé'].includes(statut)) {
      return res.status(400).json({
        error: true,
        message: 'Le statut doit être "actif" ou "fermé"',
        code: 'INVALID_STATUS'
      });
    }

    // Check balance before closing
    if (statut === 'fermé' && compte.solde !== 0) {
      return res.status(409).json({
        error: true,
        message: 'Impossible de fermer un compte avec un solde non nul',
        code: 'NON_ZERO_BALANCE',
        details: {
          currentBalance: compte.solde
        }
      });
    }

    const updated = db.updateInCollection('comptes', req.params.id, { statut });

    res.json({
      success: true,
      data: updated
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
