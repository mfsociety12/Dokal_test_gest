/**
 * Clients Routes
 *
 * WARNING: This file contains Bug #2 (phone validation)
 * TODO: Complete the implementation as described in INSTRUCTIONS.md
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

/**
 * Validation helper for client data
 */
function validateClientData(data, isUpdate = false) {
  const errors = [];

  // Validate nom
  if (!isUpdate || data.nom !== undefined) {
    if (!data.nom || data.nom.length < 2 || data.nom.length > 50) {
      errors.push('Le nom doit contenir entre 2 et 50 caractères');
    }
    if (data.nom && !/^[a-zA-ZÀ-ÿ\s-]+$/.test(data.nom)) {
      errors.push('Le nom ne doit contenir que des lettres');
    }
  }

  // Validate prenom
  if (!isUpdate || data.prenom !== undefined) {
    if (!data.prenom || data.prenom.length < 2 || data.prenom.length > 50) {
      errors.push('Le prénom doit contenir entre 2 et 50 caractères');
    }
    if (data.prenom && !/^[a-zA-ZÀ-ÿ\s-]+$/.test(data.prenom)) {
      errors.push('Le prénom ne doit contenir que des lettres');
    }
  }

  // BUG #2: This phone validation is too weak!
  // It accepts invalid numbers like "abc123" or "123"
  // Fix: Implement proper validation for Burkina Faso format (+226 XX XX XX XX)
  if (!isUpdate || data.telephone !== undefined) {
    if (!data.telephone) {
      errors.push('Le numéro de téléphone est obligatoire');
    }
    // This regex is intentionally broken - it's too permissive
    if (data.telephone && data.telephone.length < 3) {
      errors.push('Le numéro de téléphone est invalide');
    }
  }

  // Validate email (optional)
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('L\'email est invalide');
    }
  }

  // Validate adresse
  if (!isUpdate || data.adresse !== undefined) {
    if (!data.adresse || data.adresse.trim().length === 0) {
      errors.push('L\'adresse est obligatoire');
    }
  }

  return errors;
}

/**
 * POST /api/clients
 * Create a new client
 */
router.post('/', (req, res) => {
  // TODO: Implement this endpoint
  // Steps:
  // 1. Validate the request body
  // 2. Create a new client object with all required fields
  // 3. Add to database
  // 4. Return 201 with the created client

  try {
    const errors = validateClientData(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    const newClient = {
      id: uuidv4(),
      nom: req.body.nom,
      prenom: req.body.prenom,
      telephone: req.body.telephone,
      email: req.body.email || null,
      adresse: req.body.adresse,
      dateCreation: new Date().toISOString(),
      statut: 'actif'
    };

    db.addToCollection('clients', newClient);

    res.status(201).json({
      success: true,
      data: newClient
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
 * GET /api/clients
 * List all clients
 */
router.get('/', (req, res) => {
  // TODO: Implement this endpoint
  // Steps:
  // 1. Get query parameter 'statut' (actif|inactif|tous)
  // 2. Filter clients based on status
  // 3. Return the list

  try {
    const { statut = 'actif' } = req.query;
    let clients = db.getCollection('clients');

    if (statut !== 'tous') {
      clients = clients.filter(c => c.statut === statut);
    }

    res.json({
      success: true,
      data: clients,
      count: clients.length
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
 * GET /api/clients/:id
 * Get a single client by ID
 */
router.get('/:id', (req, res) => {
  // TODO: Implement this endpoint
  // Hint: Use db.findById()

  try {
    const client = db.findById('clients', req.params.id);

    if (!client) {
      return res.status(404).json({
        error: true,
        message: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: client
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
 * PUT /api/clients/:id
 * Update a client
 */
router.put('/:id', (req, res) => {
  // TODO: Implement this endpoint
  // Important: Don't allow updating id or dateCreation

  try {
    const client = db.findById('clients', req.params.id);

    if (!client) {
      return res.status(404).json({
        error: true,
        message: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Validate updates
    const errors = validateClientData(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    // Don't allow changing id or dateCreation
    const updates = { ...req.body };
    delete updates.id;
    delete updates.dateCreation;

    const updated = db.updateInCollection('clients', req.params.id, updates);

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

/**
 * DELETE /api/clients/:id
 * Soft delete a client (mark as inactive)
 */
router.delete('/:id', (req, res) => {
  // TODO: Implement this endpoint
  // Important: Check that the client has no active accounts before deleting

  try {
    const client = db.findById('clients', req.params.id);

    if (!client) {
      return res.status(404).json({
        error: true,
        message: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Check for active accounts
    const activeComptes = db.findInCollection('comptes', c =>
      c.clientId === req.params.id && c.statut === 'actif'
    );

    if (activeComptes.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'Impossible de supprimer un client avec des comptes actifs',
        code: 'HAS_ACTIVE_ACCOUNTS',
        details: {
          activeAccounts: activeComptes.length
        }
      });
    }

    // Soft delete - just mark as inactive
    db.updateInCollection('clients', req.params.id, { statut: 'inactif' });

    res.json({
      success: true,
      message: 'Client désactivé avec succès'
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
