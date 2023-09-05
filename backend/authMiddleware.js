const jwt = require('jsonwebtoken');
const { getConnection } = require('./db'); // Import getConnection, assuming db.js is in the same folder
const SECRET_KEY = process.env.SECRET_KEY; // Import your SECRET_KEY

const getAccessTokenForUser = (username) => {
    return new Promise((resolve, reject) => {
        getConnection((err, connection) => {
            if (err) {
                console.error('Error in getting a database connection:', err);
                return reject(err);
            }

            const query = 'SELECT access_token FROM users WHERE username = ?';
            connection.query(query, [username], (error, results) => {
                connection.release();

                if (error) {
                    return reject(error);
                }

                if (results.length === 0) {
                    return reject(new Error('No user found with the given username.'));
                }

                resolve(results[0].access_token);
            });
        });
    });
};

const validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const usernameHeader = req.headers['username'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.status(401).json({ error: 'No token provided' });

        jwt.verify(token, SECRET_KEY, (err, decodedPayload) => { // Use SECRET_KEY here
            if (err) {
                return res.status(403).json({ error: 'Invalid token', details: err });
            }

            // Validate if username in header matches with the username in the decoded payload
            if (usernameHeader && usernameHeader !== decodedPayload.username) {
                return res.status(403).json({ error: 'Username does not match with the token' });
            }

            req.authHeader = {
                username: usernameHeader,
                decoded: decodedPayload  // you can store the decoded payload for future use
            };

            next();
        });
    } catch (err) {
        console.error('An error occurred:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err });
    }
};

module.exports = validateToken;
