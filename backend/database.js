/**
 * In-Memory Database Module
 *
 * TODO: Implement the database functionality as described in INSTRUCTIONS.md
 * This file should provide simple CRUD operations for the collections:
 * - clients
 * - comptes
 * - transactions
 */

const { v4: uuidv4 } = require('uuid');

// In-memory storage
const db = {
  clients: [],
  comptes: [],
  transactions: []
};

/**
 * Initialize the database with sample data
 * This helps with testing and development
 */
function initDatabase() {
  console.log('📚 Initializing database...');

  // Sample client
  const sampleClient = {
    id: uuidv4(),
    nom: 'Ouedraogo',
    prenom: 'Aminata',
    telephone: '+226 70 12 34 56',
    email: 'aminata.ouedraogo@email.com',
    adresse: 'Ouagadougou, Secteur 15',
    dateCreation: new Date().toISOString(),
    statut: 'actif'
  };

  db.clients.push(sampleClient);

  // Sample compte
  const sampleCompte = {
    id: uuidv4(),
    clientId: sampleClient.id,
    numeroCompte: generateNumeroCompte(),
    solde: 50000,
    devise: 'XOF',
    type: 'epargne',
    dateOuverture: new Date().toISOString(),
    statut: 'actif'
  };

  db.comptes.push(sampleCompte);

  // Sample transaction
  const sampleTransaction = {
    id: uuidv4(),
    compteId: sampleCompte.id,
    type: 'depot',
    montant: 50000,
    devise: 'XOF',
    description: 'Dépôt initial',
    dateTransaction: new Date().toISOString(),
    statut: 'reussie'
  };

  db.transactions.push(sampleTransaction);

  console.log(`✅ Database initialized with ${db.clients.length} clients, ${db.comptes.length} comptes, ${db.transactions.length} transactions`);
}

/**
 * Generate a unique account number
 * Format: BF-XXXXX-XXXXX
 */
function generateNumeroCompte() {
  const part1 = Math.floor(10000 + Math.random() * 90000);
  const part2 = Math.floor(10000 + Math.random() * 90000);
  return `BF-${part1}-${part2}`;
}

/**
 * Get a collection by name
 * @param {string} name - Collection name (clients, comptes, transactions)
 * @returns {Array} The collection array
 */
function getCollection(name) {
  // TODO: Implement this function
  // Hint: Return the appropriate collection from the db object
  // Add validation to ensure the collection exists
  if (!db[name]) {
    throw new Error(`Collection ${name} does not exist`);
  }
  return db[name];
}

/**
 * Add an item to a collection
 * @param {string} name - Collection name
 * @param {object} item - Item to add (should include an id)
 * @returns {object} The added item
 */
function addToCollection(name, item) {
  // TODO: Implement this function
  // Hint:
  // 1. Get the collection
  // 2. Add the item to it
  // 3. Return the item
  const collection = getCollection(name);
  collection.push(item);
  return item;
}

/**
 * Update an item in a collection
 * @param {string} name - Collection name
 * @param {string} id - Item ID
 * @param {object} updates - Object with fields to update
 * @returns {object|null} The updated item or null if not found
 */
function updateInCollection(name, id, updates) {
  // TODO: Implement this function
  // Hint:
  // 1. Find the item by id
  // 2. Merge the updates with the existing item
  // 3. Return the updated item
  const collection = getCollection(name);
  const index = collection.findIndex(item => item.id === id);

  if (index === -1) {
    return null;
  }

  collection[index] = { ...collection[index], ...updates };
  return collection[index];
}

/**
 * Delete an item from a collection
 * @param {string} name - Collection name
 * @param {string} id - Item ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteFromCollection(name, id) {
  // TODO: Implement this function
  // Hint:
  // 1. Find the item index
  // 2. Use splice to remove it
  // 3. Return true/false based on success
  const collection = getCollection(name);
  const index = collection.findIndex(item => item.id === id);

  if (index === -1) {
    return false;
  }

  collection.splice(index, 1);
  return true;
}

/**
 * Find items in a collection matching a predicate
 * @param {string} name - Collection name
 * @param {function} predicate - Function that returns true for matching items
 * @returns {Array} Array of matching items
 */
function findInCollection(name, predicate) {
  // TODO: Implement this function
  // Hint: Use Array.filter with the predicate function
  const collection = getCollection(name);
  return collection.filter(predicate);
}

/**
 * Find a single item by ID
 * @param {string} name - Collection name
 * @param {string} id - Item ID
 * @returns {object|null} The item or null if not found
 */
function findById(name, id) {
  const collection = getCollection(name);
  return collection.find(item => item.id === id) || null;
}

/**
 * Clear all data from a collection (useful for testing)
 * @param {string} name - Collection name
 */
function clearCollection(name) {
  const collection = getCollection(name);
  collection.length = 0;
}

/**
 * Get database statistics
 * @returns {object} Stats object
 */
function getStats() {
  return {
    clients: db.clients.length,
    comptes: db.comptes.length,
    transactions: db.transactions.length,
    clientsActifs: db.clients.filter(c => c.statut === 'actif').length,
    comptesActifs: db.comptes.filter(c => c.statut === 'actif').length
  };
}

module.exports = {
  initDatabase,
  getCollection,
  addToCollection,
  updateInCollection,
  deleteFromCollection,
  findInCollection,
  findById,
  clearCollection,
  getStats,
  generateNumeroCompte
};
