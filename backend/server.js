const jwt = require('jsonwebtoken');
const validateToken = require('./authMiddleware');
const {v4: uuid} = require('uuid');
const express = require('express');
const cors = require('cors');
const {getConnection, createDatabaseIfNotExists, createDefaultTables, createFavicon} = require('./db');
const SECRET_KEY = process.env.SECRET_KEY;
const {spawn} = require('child_process');

require('dotenv').config();

const app = express();

// Configure CORS to allow multiple origins
const allowedOrigins = ['http://localhost:50005', 'http://71.42.29.18:50005', 'http://192.168.1.227:50005', 'http://0.0.0.0:50005', 'http://localhost:53000'];

const corsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// Your other middleware and route handling code here

const SERVER_PORT = process.env.SERVER_PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';

const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE; // Get Python executable path from environment

const initializeServer = () => {
    createDatabaseIfNotExists(err => {
        if (err) return console.error('Failed to create database:', err);
        console.log('Database exists.');

        createDefaultTables(err => {
            if (err) return console.error('Failed to create tables:', err);
            console.log('Tables exist.');
        });

        createFavicon(err => {
            if (err) console.error('Failed to create favicon:', err);
        });
    });
};

initializeServer();

const handleDbError = (err, res) => {
    console.error('Database error:', err);
    res.json({success: false, message: 'Database error'});
};

app.post('/api/login', (req, res) => {
    const {username, password} = req.body;

    getConnection((err, connection) => {
        if (err) return handleDbError(err, res);

        const sql = 'SELECT password FROM users WHERE username = ?';
        connection.query(sql, [username], (err, result) => {
            connection.release();
            if (err) return handleDbError(err, res);
            if (!result.length) return res.json({success: false, message: 'Invalid credentials'});

            const dbPassword = result[0].password;

            if (dbPassword !== password) return res.json({success: false, message: 'Invalid credentials'});

            // Create a JWT
            const access_token = jwt.sign(
                {username}, // payload: the user info you want to store
                SECRET_KEY, // secret key: keep this in an environment variable for better security
                {expiresIn: '1h'} // options: sets token to expire in 1 hour
            );

            // Save the JWT to the database (this step is optional)
            const updateTokenSql = 'UPDATE users SET access_token = ? WHERE username = ?';
            connection.query(updateTokenSql, [access_token, username], err => {
                if (err) return handleDbError(err, res);
                res.json({success: true, access_token});
            });
        });
    });
});

app.post('/api/filenames', (req, res) => {
    const {access_token} = req.body;

    getConnection((err, connection) => {
        if (err) return handleDbError(err, res);

        const findUserIdQuery = 'SELECT id FROM users WHERE access_token = ?';
        connection.query(findUserIdQuery, [access_token], (err, result) => {
            connection.release();
            if (err) return handleDbError(err, res);
            if (!result.length) return res.json({success: false, message: 'Invalid access token'});

            const userId = result[0].user_id;
            const fetchFilenamesQuery = 'SELECT filename FROM pictures WHERE id = ?';
            connection.query(fetchFilenamesQuery, [userId], (err, filenamesResult) => {
                if (err) return handleDbError(err, res);
                const filenames = filenamesResult.map(row => row.file_name);
                res.json({success: true, filenames});
            });
        });
    });
});

app.use('/api/validate-token', validateToken);

app.get('/api/validate-token', (req, res) => {
    res.send('This is a protected route.');
});

app.post('/api/generate-image', (req, res) => {
    const {
        seed = -1,
        prompt = 'a photograph of a cat',
        file_identifier = 'cat',
        height = 312,
        width = 312,
        inference_steps = 50,
        prompt_strength = 10.0,
        multiple = false,
    } = req.body;

    // Execute the Python script using the `spawn` function
    const pythonProcess = spawn(PYTHON_EXECUTABLE, [
        './generate_image.py',
        `--seed=${seed}`,
        `--prompt=${prompt}`,
        `--file_identifier=${file_identifier}`,
        `--height=${height}`,
        `--width=${width}`,
        `--inference_steps=${inference_steps}`,
        `--prompt_strength=${prompt_strength}`
    ]);

    // Handle the output of the Python script
    pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Python Script Output: ${output}`);

        // You can send the output to the frontend if needed
        res.json({success: true, message: 'Image generation successful', output});
    });

    // pythonProcess.stderr.on('data', (data) => {
    //     const errorOutput = data.toString();
    //     console.error(`Python Script Error Output: ${errorOutput}`);
    // });
    // Handle the script's exit event
    // pythonProcess.on('close', (code) => {
    //     if (code === 0) {
    //         // Python script executed successfully
    //         console.log('Python Script Completed');
    //     } else {
    //         // Python script encountered an error
    //         console.error(`Python Script Exited with Code ${code}`);
    //     }
    // });
});

app.listen(SERVER_PORT, SERVER_HOST, () => console.log(`Server running on http://${SERVER_HOST}:${SERVER_PORT}/`));
