/**
 * Main Server File - Banking Management System
 * Dokal Africa - Technical Assessment
 *
 * WARNING: This file contains bugs that need to be fixed!
 * See INSTRUCTIONS.md for details
 */

const express = require('express');
const cors = require('cors');
const database = require('./database');

// BUG #1: This line will cause issues - can you spot it?
const app = express;

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
database.initDatabase();

// Import routes
const clientsRoutes = require('./routes/clients');
const comptesRoutes = require('./routes/comptes');
const transactionsRoutes = require('./routes/transactions');

// Register routes
app.use('/api/clients', clientsRoutes);
app.use('/api/comptes', comptesRoutes);
app.use('/api/transactions', transactionsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API de Gestion Bancaire - Dokal Africa',
    version: '1.0.0',
    endpoints: {
      clients: '/api/clients',
      comptes: '/api/comptes',
      transactions: '/api/transactions',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: true,
    message: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
