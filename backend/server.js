// Importing required modules and libraries
const express = require('express');
const cors = require('cors');
const {
  getConnection,
  createDatabaseIfNotExists,
  createDefaultTables,
  createFavicon,
} = require('./db');

// Load environment variables from .env file
require('dotenv').config();

// Create an express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Load environment variables
const SERVER_PORT = process.env.SERVER_PORT || 3000; // Fallback to 3000 if SERVER_PORT is not set
const SERVER_HOST = process.env.SERVER_HOST || 'localhost'; // Fallback to localhost if SERVER_HOST is not set

// Function to initialize the database and start the server
const initializeServer = () => {
  createDatabaseIfNotExists((err) => {
    if (err) {
      console.error('Failed to create database:', err);
      return;
    }

    console.log('Database created or already exists.');

    createDefaultTables((err) => {
      if (err) {
        console.error('Failed to create or populate tables:', err);
        return;
      }

      console.log('Tables created and populated with default values.');
    });

    createFavicon((err) => {
      if (err) {
        console.error('Could not create favicon:', err);
      }
    });
  });
};

// Initialize the server
initializeServer();

// Login API endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Validate credentials (Note: Replace this with proper authentication in production)
  if (username === 'admin' && password === 'password') {
    // Here you can generate an access_token using a library or random string
    const access_token = 'some_access_token';

    // Send success response
    res.json({ success: true, access_token });
  } else {
    // Send failure response
    res.json({ success: false });
  }
});

// Start the server
app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log(`Server running on http://${SERVER_HOST}:${SERVER_PORT}/`);
});
