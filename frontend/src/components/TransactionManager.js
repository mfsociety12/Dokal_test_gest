/**
 * Transaction Manager Component
 *
 * TODO: Implement the transaction management interface as described in INSTRUCTIONS.md
 */

import * as api from '../api.js';
import { showLoading, hideLoading, showError, showSuccess, app } from '../app.js';

export const TransactionManager = {
  transactions: [],
  comptes: [],

  /**
   * Render the transaction management interface
   */
  async render() {
    const container = document.getElementById('view-transactions');

    // TODO: Implement this function
    // Should show:
    // 1. Tabs for Dépôt | Retrait | Transfert
    // 2. Form based on selected transaction type
    // 3. Transaction history

    container.innerHTML = `
      <div class="view-header">
        <h2>Gestion des Transactions</h2>
      </div>

      <div class="content-placeholder">
        <p>🚧 Interface de gestion des transactions à implémenter</p>
        <p>Voir INSTRUCTIONS.md - Partie 3.3</p>
      </div>
    `;
  },

  /**
   * Make a deposit
   */
  async makeDeposit(compteId, montant, description) {
    // TODO: Implement this function
    try {
      showLoading();
      const response = await api.makeDeposit({ compteId, montant, description });
      hideLoading();
      showSuccess(`Dépôt effectué avec succès! Nouveau solde: ${response.nouveauSolde} XOF`);
      this.render();
    } catch (error) {
      hideLoading();
      showError('Erreur: ' + error.message);
    }
  },

  /**
   * Make a withdrawal
   */
  async makeWithdrawal(compteId, montant, description) {
    // TODO: Implement this function
  },

  /**
   * Make a transfer
   */
  async makeTransfer(compteSourceId, compteDestinataireId, montant, description) {
    // TODO: Implement this function
  }
};

window.TransactionManager = TransactionManager;
