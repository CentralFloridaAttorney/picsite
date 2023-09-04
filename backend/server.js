// Importing required modules
const express = require('express');
const cors = require('cors');
const { getConnection, createDatabaseIfNotExists, createDefaultTables } = require('./db');

// Create an express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Create the database if it doesn't exist, then start the server
createDatabaseIfNotExists((err) => {
  if (err) {
    console.error('Failed to create database:', err);
    return;
  }

  console.log('Database created or already exists.');

  // Your existing routes and server code here...

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
  });
});
createDatabaseIfNotExists((err) => {
  if (err) {
    console.error('Failed to create database:', err);
    return;
  }

  console.log('Database created or already exists.');

  // Create default tables and insert default values
  createDefaultTables((err) => {
    if (err) {
      console.error('Failed to create or populate tables:', err);
      return;
    }

    console.log('Tables created and populated with default values.');

    // ... (existing server start code)
  });
});