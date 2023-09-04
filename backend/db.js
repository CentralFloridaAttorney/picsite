const mysql = require('mysql');
const {v4: uuidv4} = require('uuid');
const {join} = require("path");
const fs = require('fs');
const path = require('path');
const {createCanvas} = require("canvas");

require('dotenv').config();

// Initial database configuration
const initialDbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'bilbo',
    password: process.env.DB_PASSWORD || 'baggins'
};

const defaultUsername = 'bilbo';

// Function to create the database if it doesn't exist
const createDatabaseIfNotExists = (callback) => {
    const connection = mysql.createConnection(initialDbConfig);
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return callback(err);
        }
        connection.query(`CREATE DATABASE IF NOT EXISTS picstack_db`, (err) => {
            if (err) {
                console.error('Error creating database:', err);
                return callback(err);
            }
            connection.end();
            callback(null);
        });
    });
};

// Complete database configuration
const dbConfig = {
    ...initialDbConfig,
    database: 'picstack_db'
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Function to get a connection from the pool
const getConnection = (callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error in getting a database connection:', err);
            return callback(err);
        }
        callback(null, connection);
    });
};

// Function to create default tables
const createDefaultTables = (callback) => {
    getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        // SQL query to create the users table
        const createUserTableSQL = `
            CREATE TABLE IF NOT EXISTS users
            (
                id           CHAR(36) PRIMARY KEY,
                username     VARCHAR(255) UNIQUE NOT NULL,
                password     VARCHAR(255)        NOT NULL,
                access_token CHAR(36)
            );
        `;

        // SQL query to create the pictures table
        const createPictureTableSQL = `
            CREATE TABLE IF NOT EXISTS pictures
            (
                id       CHAR(36) PRIMARY KEY,
                user_id  CHAR(36),
                filename VARCHAR(255) DEFAULT 'default.png',
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        `;

        const access_token = uuidv4();

        // SQL query to insert a default user
        const insertDefaultUserSQL = `INSERT IGNORE INTO users (id, username, password, access_token)
                                      VALUES (UUID(), ?, 'password', '${access_token}');`;

        connection.query(createUserTableSQL, (err) => {
            if (err) {
                connection.release();
                return callback(err);
            }

            connection.query(createPictureTableSQL, (err) => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                connection.query(insertDefaultUserSQL, [defaultUsername], (err) => {
                    if (err) {
                        connection.release();
                        return callback(err);
                    }

                    // Retrieve the user_id for the default username
                    connection.query(`SELECT id
                                      FROM users
                                      WHERE username = ?`, [defaultUsername], (err, results) => {
                        if (err || results.length === 0) {
                            connection.release();
                            return callback(err || new Error("Default user not found"));
                        }

                        const userId = results[0].id;

                        // Insert the default picture using the retrieved user_id
                        const insertDefaultPictureSQL = `INSERT IGNORE INTO pictures (id, user_id, filename)
                                                         VALUES (UUID(), ?, 'default.png');`;
                        connection.query(insertDefaultPictureSQL, [userId], (err) => {
                            connection.release();
                            if (err) {
                                return callback(err);
                            }

                            callback(null);
                        });
                    });
                });
            });
        });
    });
};

/**
 * Function to create a favicon.ico that is a yellow square with a red circle in the middle.
 * Saves it in a folder named "db_out" and creates the directory if it doesn't exist.
 * @param {Function} callback
 */
/**
 * Function to create a favicon.ico and default.png that are yellow squares with a red circle in the middle.
 * Saves them in a folder named "public" in the frontend directory and creates the directory if it doesn't exist.
 * @param {Function} callback
 */
const createFavicon = (callback) => {
    try {
        const canvas = createCanvas(256, 256);
        const ctx = canvas.getContext('2d');

        // Draw a yellow square
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(0, 0, 256, 256);

        // Draw a red circle in the middle
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(128, 128, 64, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Calculate directory paths
        const currentDir = __dirname;
        const frontendDir = path.resolve(currentDir, '..', 'frontend');
        const dir = path.join(frontendDir, 'public');

        // Create directory if it does not exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save image as favicon.ico
        const faviconPath = path.join(dir, 'favicon.ico');
        const faviconBuffer = canvas.toBuffer('image/png'); // Generate buffer from canvas
        fs.writeFileSync(faviconPath, faviconBuffer);

        // Save image as default.png
        const defaultPngPath = path.join(dir, 'default.png');
        fs.writeFileSync(defaultPngPath, faviconBuffer);

        console.log('Favicon and default.png created successfully.');
        callback(null);
    } catch (err) {
        console.error('Error creating image:', err);
        callback(err);
    }
};

module.exports = {
    getConnection,
    createDatabaseIfNotExists,
    createDefaultTables,
    createFavicon
};
