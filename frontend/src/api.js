/**
 * API Client Module
 * Handles all communication with the backend API
 *
 * WARNING: This file contains Bug #4 (incorrect API request configuration)
 * TODO: Fix the bugs and ensure all API calls work correctly
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Make an API request
 * BUG #4: The POST/PUT requests don't work properly!
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // BUG #4: The headers are missing for POST/PUT requests!
  // This causes the server to not parse the JSON body correctly
  const config = {
    method: options.method || 'GET',
    // Missing headers! Should include Content-Type: application/json
    ...options
  };

  // Only add body if it's not a GET request
  if (config.method !== 'GET' && options.body) {
    // BUG #4: The body is not being stringified!
    // JSON data needs to be converted to a string
    config.body = options.body; // Should be JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============ Clients API ============

/**
 * Get all clients
 * @param {string} statut - Filter by status (actif|inactif|tous)
 */
export async function getClients(statut = 'actif') {
  return apiRequest(`/clients?statut=${statut}`);
}

/**
 * Get a single client by ID
 */
export async function getClient(id) {
  return apiRequest(`/clients/${id}`);
}

/**
 * Create a new client
 */
export async function createClient(clientData) {
  return apiRequest('/clients', {
    method: 'POST',
    body: clientData
  });
}

/**
 * Update a client
 */
export async function updateClient(id, updates) {
  return apiRequest(`/clients/${id}`, {
    method: 'PUT',
    body: updates
  });
}

/**
 * Delete (deactivate) a client
 */
export async function deleteClient(id) {
  return apiRequest(`/clients/${id}`, {
    method: 'DELETE'
  });
}

// ============ Comptes API ============

/**
 * Create a new account
 */
export async function createCompte(compteData) {
  // TODO: Implement this function
  return apiRequest('/comptes', {
    method: 'POST',
    body: compteData
  });
}

/**
 * Get all accounts for a client
 */
export async function getComptesForClient(clientId) {
  // TODO: Implement this function
  return apiRequest(`/comptes/client/${clientId}`);
}

/**
 * Get a single account by ID
 */
export async function getCompte(id) {
  // TODO: Implement this function
  return apiRequest(`/comptes/${id}`);
}

/**
 * Update account status
 */
export async function updateCompteStatut(id, statut) {
  // TODO: Implement this function
  return apiRequest(`/comptes/${id}/statut`, {
    method: 'PUT',
    body: { statut }
  });
}

// ============ Transactions API ============

/**
 * Make a deposit
 */
export async function makeDeposit(depositData) {
  // TODO: Implement this function
  return apiRequest('/transactions/depot', {
    method: 'POST',
    body: depositData
  });
}

/**
 * Make a withdrawal
 */
export async function makeWithdrawal(withdrawalData) {
  // TODO: Implement this function
  return apiRequest('/transactions/retrait', {
    method: 'POST',
    body: withdrawalData
  });
}

/**
 * Make a transfer
 */
export async function makeTransfer(transferData) {
  // TODO: Implement this function
  return apiRequest('/transactions/transfert', {
    method: 'POST',
    body: transferData
  });
}

/**
 * Get transaction history for an account
 */
export async function getTransactions(compteId, limit = 50) {
  // TODO: Implement this function
  return apiRequest(`/transactions/compte/${compteId}?limit=${limit}`);
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(id) {
  // TODO: Implement this function
  return apiRequest(`/transactions/${id}`);
}
