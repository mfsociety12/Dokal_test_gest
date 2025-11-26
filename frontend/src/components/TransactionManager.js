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
  currentTab: 'depot',
  filterType: 'tous',

  /**
   * Render the transaction management interface
   */
  async render() {
    const container = document.getElementById('view-transactions');

    // Il faut un compte sélectionné depuis l’onglet Comptes
    if (!app.selectedClient || !app.selectedCompte) {
      container.innerHTML = `
        <div class="view-header">
          <h2>Gestion des Transactions</h2>
        </div>
        <div class="empty-state">
          <p>Sélectionnez d'abord un client et un compte dans l'onglet "Comptes".</p>
        </div>
      `;
      return;
    }

    try {
      showLoading();

      // Charger les comptes du client sélectionné
      const comptesResponse = await api.getComptesForClient(app.selectedClient);
      this.comptes = comptesResponse.data || [];

      const currentCompte =
        this.comptes.find(c => c.id === app.selectedCompte) || this.comptes[0];
      app.selectedCompte = currentCompte ? currentCompte.id : null;

      if (!currentCompte) {
        hideLoading();
        container.innerHTML = `
          <div class="view-header">
            <h2>Gestion des Transactions</h2>
          </div>
          <div class="empty-state">
            <p>Aucun compte trouvé pour ce client.</p>
          </div>
        `;
        return;
      }

      // Charger l’historique des transactions
      const txResponse = await api.getTransactions(app.selectedCompte, 50);
      this.transactions = txResponse.data || [];

      hideLoading();

      container.innerHTML = `
        <div class="view-header">
          <h2>Gestion des Transactions</h2>
          <div>
            <strong>Compte sélectionné :</strong>
            ${currentCompte.numeroCompte} - Solde actuel :
            <span id="current-balance">${currentCompte.solde}</span> ${currentCompte.devise}
          </div>
        </div>

        <div class="form-card">
          <div class="form-row" style="margin-bottom: 1rem;">
            <div class="form-group">
              <label>Type de transaction</label>
              <div>
                <button type="button" class="btn btn-sm ${this.currentTab === 'depot' ? 'btn-primary' : 'btn-secondary'}" data-tab="depot">Dépôt</button>
                <button type="button" class="btn btn-sm ${this.currentTab === 'retrait' ? 'btn-primary' : 'btn-secondary'}" data-tab="retrait">Retrait</button>
                <button type="button" class="btn btn-sm ${this.currentTab === 'transfert' ? 'btn-primary' : 'btn-secondary'}" data-tab="transfert">Transfert</button>
              </div>
            </div>
          </div>

          <form id="transaction-form">
            <div class="form-row">
              <div class="form-group">
                <label for="compte-source">Compte source *</label>
                <select id="compte-source" required>
                  ${this.comptes
                    .map(c => `
                    <option value="${c.id}" ${c.id === app.selectedCompte ? 'selected' : ''}>
                      ${c.numeroCompte} (${c.type}) – ${c.solde} ${c.devise}
                    </option>`)
                    .join('')}
                </select>
              </div>

              <div class="form-group" id="compte-dest-group" style="${this.currentTab === 'transfert' ? '' : 'display:none;'}">
                <label for="compte-destination">Compte destination *</label>
                <select id="compte-destination">
                  ${this.comptes
                    .map(c => `
                    <option value="${c.id}">
                      ${c.numeroCompte} (${c.type}) – ${c.solde} ${c.devise}
                    </option>`)
                    .join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="montant">Montant (XOF) *</label>
                <input type="number" id="montant" min="100" step="1" required>
                <span class="error-message" id="montant-error"></span>
              </div>
              <div class="form-group">
                <label>Nouveau solde (prévisionnel)</label>
                <div id="preview-solde"> - </div>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" rows="2" maxlength="200"></textarea>
              <span class="error-message" id="description-error"></span>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="tx-submit-btn">
                Exécuter la transaction
              </button>
            </div>
          </form>
        </div>

        <div class="form-card">
          <div class="form-row" style="margin-bottom: 1rem;">
            <div class="form-group">
              <label for="filter-type">Filtrer par type</label>
              <select id="filter-type">
                <option value="tous" ${this.filterType === 'tous' ? 'selected' : ''}>Tous</option>
                <option value="depot" ${this.filterType === 'depot' ? 'selected' : ''}>Dépôt</option>
                <option value="retrait" ${this.filterType === 'retrait' ? 'selected' : ''}>Retrait</option>
                <option value="transfert" ${this.filterType === 'transfert' ? 'selected' : ''}>Transfert</option>
              </select>
            </div>
          </div>

          ${
            this.transactions.length === 0
              ? `<p class="empty-state">Aucune transaction pour ce compte.</p>`
              : `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Description</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody id="transactions-body">
                ${this.renderTransactionsRows()}
              </tbody>
            </table>
          `
          }
        </div>
      `;

      // Listeners onglets
      container.querySelectorAll('button[data-tab]').forEach(btn => {
        btn.addEventListener('click', e => {
          this.currentTab = e.currentTarget.getAttribute('data-tab');
          this.render();
        });
      });

      // Listener filtre
      const filterSelect = document.getElementById('filter-type');
      if (filterSelect) {
        filterSelect.addEventListener('change', e => {
          this.filterType = e.target.value;
          const tbody = document.getElementById('transactions-body');
          if (tbody) {
            tbody.innerHTML = this.renderTransactionsRows();
          }
        });
      }

      // Listeners preview montant
      const montantInput = document.getElementById('montant');
      const compteSourceSelect = document.getElementById('compte-source');
      const previewSoldeDiv = document.getElementById('preview-solde');

      const updatePreview = () => {
        const montant = parseFloat(montantInput.value || '0');
        const sourceCompte = this.comptes.find(c => c.id === compteSourceSelect.value);
        if (!sourceCompte || !montant || montant <= 0) {
          previewSoldeDiv.textContent = '–';
          return;
        }
        let preview = sourceCompte.solde;
        if (this.currentTab === 'depot') {
          preview = sourceCompte.solde + montant;
        } else if (this.currentTab === 'retrait' || this.currentTab === 'transfert') {
          preview = sourceCompte.solde - montant;
        }
        previewSoldeDiv.textContent = `${preview} ${sourceCompte.devise}`;
      };

      montantInput.addEventListener('input', updatePreview);
      compteSourceSelect.addEventListener('change', updatePreview);

      // Form submission
      const form = document.getElementById('transaction-form');
      form.addEventListener('submit', e => this.handleSubmit(e));
    } catch (error) {
      hideLoading();
      showError('Erreur lors du chargement des transactions: ' + error.message);
    }
  },


  renderTransactionsRows() {
    let rows = this.transactions;
    if (this.filterType !== 'tous') {
      rows = rows.filter(t => t.type === this.filterType);
    }

    if (rows.length === 0) {
      return `<tr><td colspan="5" style="text-align:center; color:#64748b;">Aucune transaction</td></tr>`;
    }

    return rows
      .map(t => {
        let color = '';
        if (t.type === 'depot' || (t.type === 'transfert' && t.montant > 0)) {
          color = 'style="color:#16a34a;"'; // vert
        } else if (t.type === 'retrait' || (t.type === 'transfert' && t.montant < 0)) {
          color = 'style="color:#dc2626;"'; // rouge
        }
        return `
          <tr>
            <td>${new Date(t.dateTransaction).toLocaleString()}</td>
            <td>${t.type}</td>
            <td ${color}>${t.montant} ${t.devise}</td>
            <td>${t.description || '-'}</td>
            <td>${t.statut}</td>
          </tr>
        `;
      })
      .join('');
  },

  async handleSubmit(e) {
    e.preventDefault();

    const compteSourceId = document.getElementById('compte-source').value;
    const compteDestIdEl = document.getElementById('compte-destination');
    const montant = parseFloat(document.getElementById('montant').value || '0');
    const description = document.getElementById('description').value;

    const montantError = document.getElementById('montant-error');
    montantError.textContent = '';

    if (!montant || montant < 100) {
      montantError.textContent = 'Le montant minimum est de 100 XOF';
      return;
    }

    try {
      if (this.currentTab === 'depot') {
        await this.makeDeposit(compteSourceId, montant, description);
      } else if (this.currentTab === 'retrait') {
        await this.makeWithdrawal(compteSourceId, montant, description);
      } else if (this.currentTab === 'transfert') {
        const compteDestId = compteDestIdEl.value;
        await this.makeTransfer(compteSourceId, compteDestId, montant, description);
      }
    } catch (err) { }
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
    try {
      showLoading();
      const response = await api.makeWithdrawal({ compteId, montant, description });
      hideLoading();
      showSuccess(
        `Retrait effectué avec succès! Nouveau solde: ${response.nouveauSolde} XOF`
      );
      // Refresh the view
      this.render();
    } catch (error) {
      hideLoading();
      showError('Erreur: ' + error.message);
    }
  },

  /**
   * Make a transfer
   */
  async makeTransfer(compteSourceId, compteDestinataireId, montant, description) {
    try {
      if (compteSourceId === compteDestinataireId) {
        showError('Les comptes source et destination doivent être différents');
        return;
      }

      showLoading();
      const response = await api.makeTransfer({
        compteSourceId,
        compteDestinataireId,
        montant,
        description
      });
      hideLoading();
      showSuccess(
        `Transfert effectué avec succès! Nouveau solde source: ${response.nouveauSoldeSource} XOF`
      );
      this.render();
    } catch (error) {
      hideLoading();
      showError('Erreur: ' + error.message);
    }
  }
};

window.TransactionManager = TransactionManager;
