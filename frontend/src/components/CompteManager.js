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

    try {
      showLoading();

      // load actives customers
      const clientsResponse = await api.getClients('actif');
      this.clients = clientsResponse.data || [];

      if (this.clients.length === 0) {
        hideLoading();
        container.innerHTML = `
          <div class="view-header">
            <h2>Gestion des Comptes</h2>
          </div>
          <div class="empty-state">
            <p>Aucun client actif. Créez d’abord un client dans l’onglet "Clients".</p>
          </div>
        `;
        return;
      }

      // Determine the selectionned customer
      const defaultClientId = app.selectedClient || this.clients[0].id;
      app.selectedClient = defaultClientId;

      // load selectionned customer balance accounts
      const comptesResponse = await api.getComptesForClient(defaultClientId);
      this.comptes = comptesResponse.data || [];

      hideLoading();

      container.innerHTML = `
        <div class="view-header">
          <h2>Gestion des Comptes</h2>
          <button class="btn btn-primary" id="btn-open-compte">
            Ouvrir un compte
          </button>
        </div>

        <div class="form-card">
          <div class="form-group">
            <label for="client-select">Client</label>
            <select id="client-select">
              ${this.clients
                .map(
                  c => `
                <option value="${c.id}" ${c.id === defaultClientId ? 'selected' : ''}>
                  ${c.nom} ${c.prenom} (${c.telephone})
                </option>
              `
                )
                .join('')}
            </select>
          </div>
        </div>

        <div class="clients-list">
          ${
            this.comptes.length === 0
              ? `<p class="empty-state">Aucun compte pour ce client. Cliquez sur "Ouvrir un compte".</p>`
              : `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Type</th>
                  <th>Solde</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${this.comptes
                  .map(
                    compte => `
                  <tr>
                    <td>${compte.numeroCompte}</td>
                    <td>${compte.type}</td>
                    <td>${compte.solde} ${compte.devise}</td>
                    <td>
                      <span class="badge badge-${compte.statut === 'actif' ? 'success' : 'secondary'}">
                        ${compte.statut}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-info" data-compte-id="${compte.id}">
                        Voir transactions
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
          }
        </div>
      `;

      // Listeners
      const select = document.getElementById('client-select');
      if (select) {
        select.addEventListener('change', e => this.onClientChange(e.target.value));
      }

      const openBtn = document.getElementById('btn-open-compte');
      if (openBtn) {
        openBtn.addEventListener('click', async () => {
          const type = window.confirm('Créer un compte "épargne" ?\nCliquez sur Annuler pour créer un compte "courant".')
            ? 'epargne'
            : 'courant';
          await this.createAccount(app.selectedClient, type);
        });
      }

      document.querySelectorAll('button[data-compte-id]').forEach(btn => {
        btn.addEventListener('click', e => {
          const compteId = e.currentTarget.getAttribute('data-compte-id');
          this.viewTransactions(compteId);
        });
      });
    } catch (error) {
      hideLoading();
      showError('Erreur lors du chargement des comptes: ' + error.message);
    }
  },

  /**
   * Change customer
   */
  async onClientChange(clientId) {
    app.selectedClient = clientId;
    await this.render();
  },

  /**
   * See transactions for an account
   */
  viewTransactions(compteId) {
    app.selectedCompte = compteId;
    // Switch to transactions view
    const btn = document.querySelector('.nav-btn[data-view="transactions"]');
    if (btn) {
      btn.click();
    } else {
      showError('Impossible de trouver l’onglet Transactions');
    }
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
