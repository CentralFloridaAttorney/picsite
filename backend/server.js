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
    const {username, password} = req.body;

    // Use getConnection to get a database connection
    getConnection((err, connection) => {
        if (err) {
            console.error('Database error:', err);
            res.json({success: false, message: 'Database error'});
            return;
        }

        const sql = 'SELECT password FROM users WHERE username = ?';

        connection.query(sql, [username], (err, result) => {
            // Always release the connection back to the pool
            connection.release();

            if (err) {
                console.error('Database error:', err);
                res.json({success: false, message: 'Database error'});
                return;
            }

            if (result.length === 0) {
                res.json({success: false, message: 'Invalid credentials'});
                return;
            }

            const dbPassword = result[0].password;

            if (dbPassword === password) {
                // Query to fetch the access_token for this user
                const tokenSql = 'SELECT access_token FROM users WHERE username = ?';

                connection.query(tokenSql, [username], (err, tokenResult) => {
                    if (err) {
                        console.error('Database error when fetching access_token:', err);
                        res.json({success: false, message: 'Database error'});
                        return;
                    }

                    if (tokenResult.length === 0) {
                        res.json({success: false, message: 'Could not retrieve access_token'});
                        return;
                    }

                    const access_token = tokenResult[0].access_token;
                    res.json({success: true, access_token});
                });
            } else {
                res.json({success: false, message: 'Invalid credentials'});
            }

        });
    });
});

// Start the server
app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`Server running on http://${SERVER_HOST}:${SERVER_PORT}/`);
});
