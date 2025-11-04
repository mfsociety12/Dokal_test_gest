/**
 * Main Application File
 * Handles routing, initialization, and view management
 *
 * TODO: Complete the implementation as described in INSTRUCTIONS.md
 */

import * as api from './api.js';
import { ClientManager } from './components/ClientManager.js';
import { CompteManager } from './components/CompteManager.js';
import { TransactionManager } from './components/TransactionManager.js';

// Global state
const app = {
  currentView: 'clients',
  selectedClient: null,
  selectedCompte: null
};

/**
 * Show loading indicator
 */
export function showLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.remove('hidden');
  }
}

/**
 * Hide loading indicator
 */
export function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
  }
}

/**
 * Show error message
 */
export function showError(message) {
  const container = document.getElementById('error-container');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'message message-error';
  errorDiv.innerHTML = `
    <span>❌ ${message}</span>
    <button class="close-btn" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * Show success message
 */
export function showSuccess(message) {
  const container = document.getElementById('success-container');
  const successDiv = document.createElement('div');
  successDiv.className = 'message message-success';
  successDiv.innerHTML = `
    <span>✅ ${message}</span>
    <button class="close-btn" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(successDiv);

  // Auto-remove after 3 seconds
  setTimeout(() => successDiv.remove(), 3000);
}

/**
 * Switch between views
 */
function switchView(viewName) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });

  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }

  app.currentView = viewName;

  // Load view content
  loadViewContent(viewName);
}

/**
 * Load content for a specific view
 */
function loadViewContent(viewName) {
  switch (viewName) {
    case 'clients':
      ClientManager.render();
      break;
    case 'comptes':
      CompteManager.render();
      break;
    case 'transactions':
      TransactionManager.render();
      break;
  }
}

/**
 * Initialize the application
 */
function init() {
  console.log('🚀 Initializing Banking Management System...');

  // Setup navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });

  // Load initial view
  loadViewContent('clients');

  console.log('✅ Application initialized');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export app state for components
export { app };
