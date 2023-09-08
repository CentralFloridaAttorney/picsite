const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const { MONGO_URI, SECRET_KEY } = process.env;

// Function to get the user's access token from MongoDB
const getAccessTokenForUser = async (username) => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const usersCollection = client.db().collection('users');

    const user = await usersCollection.findOne({ username });

    if (!user) {
      return null; // No user found with the given username
    }
     // Update the user's accessToken field in MongoDB using their username
    await usersCollection.updateOne({ _id: user._id }, { $set: { accessToken: data.access_token } });

    return user.access_token; // Assuming the access token is stored in the user document
  } catch (error) {
    console.error('Error in getting access token:', error);
    throw error;
  }
};

const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const passwordHeader = req.headers['password'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, async (err, decodedPayload) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token', details: err });
      }

      if (passwordHeader && passwordHeader !== decodedPayload.password) {
        return res.status(403).json({ error: 'Password does not match with the token' });
      }

      // Fetch the user's access token from MongoDB
      const userAccessToken = await getAccessTokenForUser(decodedPayload.username);

      if (!userAccessToken) {
        return res.status(403).json({ error: 'User not found' });
      }

      // Attach token, decoded payload, and user data to the request
      req.authData = {
        token: token,
        decoded: decodedPayload,
        user: {
          accessToken: userAccessToken,
        },
      };

      next();
    });
  } catch (err) {
    console.error('An error occurred:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err });
  }
};

module.exports = validateToken;
