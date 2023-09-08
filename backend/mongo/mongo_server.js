require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const validateToken = require('./authMiddleware');
const {v4: uuid} = require('uuid');
const cors = require('cors');
const {spawn} = require('child_process');
const {SECRET_KEY, PYTHON_EXECUTABLE} = process.env; // Import your MONGO_URI and SECRET_KEY
const app = express();
const port = 50010; // Replace with your desired port number
const allowedOrigins = ['http://localhost:50005', 'http://71.42.29.18:50005', 'http://192.168.1.227:50005', 'http://0.0.0.0:50005', 'http://localhost:53000'];
const corsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

const mongoURI = 'mongodb://localhost:50011/picstream_db'; // MongoDB connection URI

// Define the User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

// Login route
app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await User.findOne({username});

        if (!user) {
            return res.json({success: false, message: 'Invalid credentials'});
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = password === user.password;

        if (!passwordMatch) {
            return res.json({success: false, message: 'Invalid credentials'});
        }

        // Generate an access token using the SECRET_KEY
        const accessToken = jwt.sign({password: user.password}, SECRET_KEY, {
            expiresIn: '1h', // You can adjust the token expiration time as needed
        });

        // Return the access token
        return res.json({success: true, access_token: accessToken});

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({success: false, message: 'An error occurred'});
    }
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
        './generate_image_mongo.py',
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
    pythonProcess.stderr.on('data', (data) => {
        const errorOutput = data.toString();
        console.error(`Python Script Error Output: ${errorOutput}`);
    });

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

mongoose
    .connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
