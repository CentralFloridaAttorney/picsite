const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');


require('dotenv').config();

// Initial database configuration
const initialDbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'bilbo',
  password: 'baggins'
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
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        access_token CHAR(36)                             
      );
    `;

    // SQL query to create the pictures table
    const createPictureTableSQL = `
      CREATE TABLE IF NOT EXISTS pictures (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        filename VARCHAR(255) DEFAULT 'default.png',
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const access_token = uuidv4();

    // SQL query to insert a default user
    const insertDefaultUserSQL = `INSERT IGNORE INTO users (id, username, password, access_token) VALUES (UUID(), ?, 'password', '${access_token}');`;

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
          connection.query(`SELECT id FROM users WHERE username = ?`, [defaultUsername], (err, results) => {
            if (err || results.length === 0) {
              connection.release();
              return callback(err || new Error("Default user not found"));
            }

            const userId = results[0].id;

            // Insert the default picture using the retrieved user_id
            const insertDefaultPictureSQL = `INSERT IGNORE INTO pictures (id, user_id, filename) VALUES (UUID(), ?, 'default.png');`;
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

module.exports = {
  getConnection,
  createDatabaseIfNotExists,
  createDefaultTables
};
