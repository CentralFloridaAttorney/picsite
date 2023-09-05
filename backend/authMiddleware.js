const jwt = require('jsonwebtoken');
const {getConnection} = require('./db'); // Import getConnection, assuming db.js is in the same folder

// Convert getAccessTokenForUser to return a Promise
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

// Make validateToken an async function
const validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const usernameHeader = req.headers['username'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.status(401).json({error: 'No token provided'});

        const username_access_token = await getAccessTokenForUser(usernameHeader);
        console.log('Extracted Token:', token);
        console.log('User-specific Access Token:', username_access_token);

        jwt.verify(token, username_access_token, (err, decodedPayload) => {
            if (err) {
                return res.status(403).json({error: 'Invalid token', details: err});
            }

            req.authHeader = {
                username: usernameHeader,
                decoded: decodedPayload  // you can store the decoded payload for future use
            };

            next();
        });
    } catch (err) {
        console.error('An error occurred:', err);
        res.status(500).json({error: 'Internal Server Error', details: err});
    }
};


module.exports = validateToken;
