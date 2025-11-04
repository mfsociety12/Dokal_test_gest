/**
 * Compte (Account) Manager Component
 *
 * TODO: Implement the account management interface as described in INSTRUCTIONS.md
 */

import * as api from '../api.js';
import { showLoading, hideLoading, showError, showSuccess, app } from '../app.js';

export const CompteManager = {
  comptes: [],
  clients: [],

  /**
   * Render the account management interface
   */
  async render() {
    const container = document.getElementById('view-comptes');

    // TODO: Implement this function
    // Should show:
    // 1. Client selector
    // 2. List of accounts for selected client
    // 3. Button to create new account

    container.innerHTML = `
      <div class="view-header">
        <h2>Gestion des Comptes</h2>
      </div>

      <div class="content-placeholder">
        <p>🚧 Interface de gestion des comptes à implémenter</p>
        <p>Voir INSTRUCTIONS.md - Partie 3.2</p>
      </div>
    `;
  },

  /**
   * Create a new account
   */
  async createAccount(clientId, type) {
    // TODO: Implement this function
    try {
      showLoading();
      const response = await api.createCompte({ clientId, type });
      hideLoading();
      showSuccess(`Compte créé avec succès! Numéro: ${response.data.numeroCompte}`);
      this.render();
    } catch (error) {
      hideLoading();
      showError('Erreur: ' + error.message);
    }
  }
};

window.CompteManager = CompteManager;
