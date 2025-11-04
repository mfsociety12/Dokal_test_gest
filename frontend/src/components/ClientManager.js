/**
 * Client Manager Component
 *
 * TODO: Implement the client management interface as described in INSTRUCTIONS.md
 * This should include:
 * - List of clients
 * - Client creation form
 * - Client editing
 * - Real-time validation
 */

import * as api from '../api.js';
import { showLoading, hideLoading, showError, showSuccess, app } from '../app.js';

export const ClientManager = {
  clients: [],
  editingClient: null,

  /**
   * Render the client management interface
   */
  async render() {
    const container = document.getElementById('view-clients');

    try {
      showLoading();
      const response = await api.getClients('tous');
      this.clients = response.data || [];
      hideLoading();

      container.innerHTML = `
        <div class="view-header">
          <h2>Gestion des Clients</h2>
          <button class="btn btn-primary" onclick="ClientManager.showCreateForm()">
            ➕ Nouveau Client
          </button>
        </div>

        <div id="client-form-container"></div>

        <div class="clients-list">
          ${this.renderClientsList()}
        </div>
      `;
    } catch (error) {
      hideLoading();
      showError('Erreur lors du chargement des clients: ' + error.message);
    }
  },

  /**
   * Render the list of clients
   */
  renderClientsList() {
    if (this.clients.length === 0) {
      return '<p class="empty-state">Aucun client trouvé. Créez un nouveau client pour commencer.</p>';
    }

    return `
      <table class="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.clients.map(client => `
            <tr>
              <td>${client.nom}</td>
              <td>${client.prenom}</td>
              <td>${client.telephone}</td>
              <td>${client.email || '-'}</td>
              <td>
                <span class="badge badge-${client.statut === 'actif' ? 'success' : 'secondary'}">
                  ${client.statut}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-secondary" onclick="ClientManager.showEditForm('${client.id}')">
                  ✏️ Modifier
                </button>
                <button class="btn btn-sm btn-info" onclick="ClientManager.viewDetails('${client.id}')">
                  👁️ Détails
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  /**
   * Show the create client form
   */
  showCreateForm() {
    // TODO: Implement this function
    // Should display a form with all client fields
    // Include real-time validation
    const container = document.getElementById('client-form-container');
    this.editingClient = null;

    container.innerHTML = `
      <div class="form-card">
        <h3>Créer un Nouveau Client</h3>
        <form id="client-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nom">Nom *</label>
              <input type="text" id="nom" name="nom" required minlength="2" maxlength="50">
              <span class="error-message" id="nom-error"></span>
            </div>
            <div class="form-group">
              <label for="prenom">Prénom *</label>
              <input type="text" id="prenom" name="prenom" required minlength="2" maxlength="50">
              <span class="error-message" id="prenom-error"></span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="telephone">Téléphone * (Format: +226 XX XX XX XX)</label>
              <input type="tel" id="telephone" name="telephone" required
                     placeholder="+226 70 12 34 56">
              <span class="error-message" id="telephone-error"></span>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email">
              <span class="error-message" id="email-error"></span>
            </div>
          </div>

          <div class="form-group">
            <label for="adresse">Adresse *</label>
            <textarea id="adresse" name="adresse" required rows="3"></textarea>
            <span class="error-message" id="adresse-error"></span>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="ClientManager.hideForm()">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" id="submit-btn">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    `;

    // Add form validation and submission
    const form = document.getElementById('client-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Add real-time validation
    this.setupFormValidation();
  },

  /**
   * Show the edit client form
   */
  showEditForm(clientId) {
    // TODO: Implement this function
    // Similar to showCreateForm but pre-filled with client data
    const client = this.clients.find(c => c.id === clientId);
    if (!client) {
      showError('Client non trouvé');
      return;
    }

    this.editingClient = client;
    this.showCreateForm();

    // Pre-fill the form
    document.getElementById('nom').value = client.nom;
    document.getElementById('prenom').value = client.prenom;
    document.getElementById('telephone').value = client.telephone;
    document.getElementById('email').value = client.email || '';
    document.getElementById('adresse').value = client.adresse;

    // Update title
    document.querySelector('.form-card h3').textContent = 'Modifier le Client';
  },

  /**
   * Hide the form
   */
  hideForm() {
    const container = document.getElementById('client-form-container');
    container.innerHTML = '';
    this.editingClient = null;
  },

  /**
   * Setup real-time form validation
   */
  setupFormValidation() {
    // TODO: Implement real-time validation
    // Validate phone number format as user types
    // Validate email format
    // Show/hide error messages
    // Enable/disable submit button based on validation

    const phoneInput = document.getElementById('telephone');
    const emailInput = document.getElementById('email');

    phoneInput.addEventListener('input', (e) => {
      const phoneRegex = /^\+226\s\d{2}\s\d{2}\s\d{2}\s\d{2}$/;
      const errorSpan = document.getElementById('telephone-error');

      if (!phoneRegex.test(e.target.value)) {
        errorSpan.textContent = 'Format invalide. Utilisez: +226 XX XX XX XX';
        e.target.classList.add('invalid');
      } else {
        errorSpan.textContent = '';
        e.target.classList.remove('invalid');
      }
    });

    emailInput.addEventListener('input', (e) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errorSpan = document.getElementById('email-error');

      if (e.target.value && !emailRegex.test(e.target.value)) {
        errorSpan.textContent = 'Format email invalide';
        e.target.classList.add('invalid');
      } else {
        errorSpan.textContent = '';
        e.target.classList.remove('invalid');
      }
    });
  },

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    const formData = {
      nom: document.getElementById('nom').value,
      prenom: document.getElementById('prenom').value,
      telephone: document.getElementById('telephone').value,
      email: document.getElementById('email').value,
      adresse: document.getElementById('adresse').value
    };

    try {
      showLoading();

      if (this.editingClient) {
        await api.updateClient(this.editingClient.id, formData);
        showSuccess('Client modifié avec succès');
      } else {
        await api.createClient(formData);
        showSuccess('Client créé avec succès');
      }

      this.hideForm();
      this.render();
    } catch (error) {
      hideLoading();
      showError('Erreur: ' + error.message);
    }
  },

  /**
   * View client details (and their accounts)
   */
  viewDetails(clientId) {
    // TODO: Implement this function
    // Should show client info and their accounts
    // Could switch to the comptes view with this client selected
    app.selectedClient = clientId;
    showSuccess('Fonctionnalité à implémenter: voir les détails du client');
  }
};

// Make it globally available for onclick handlers
window.ClientManager = ClientManager;
