const mongoose = require('mongoose');

// Define the MongoDB connection URL
const mongoURI = 'mongodb://localhost:50011/picstream_db';

// Define the User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Define the User model
const User = mongoose.model('User', userSchema);

async function createDefaultUser() {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a default user
    const defaultUser = new User({
      username: 'bilbo',
      email: 'Attorney@CentralFloridaAttorney.net',
      password: 'password',
    });

    // Save the default user to the database
    await defaultUser.save();

    console.log('Default user created and saved to the database.');

    // Disconnect from the database
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function to create the default user
response = createDefaultUser();
