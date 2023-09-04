import React, {useState} from 'react';

const uuid = require('uuid').v4; // v4 is for generating random UUIDs

// Importing crypto-browserify, making sure to keep the import style consistent.
// Please validate if it is really required in this file.
require('crypto-browserify');

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');


    // Asynchronously handle the form submission
const handleSubmit = async () => {
  try {
    const response = await fetch(`http://localhost:55055/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Use the access_token returned from the server
      document.cookie = `access_token=${data.access_token};path=/`;
      setMessage('Login successful');
    } else {
      setMessage('Invalid credentials');
    }
  } catch (error) {
    console.error('There was an error sending the request', error);
    setMessage('An error occurred');
  }
};

    // Define inline styles according to your preferences
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const inputStyle = {
        marginBottom: '20px',
    };

    return (
        <div style={containerStyle}>
            <h1>Login Page</h1>
            <div style={inputStyle}>
                <label>
                    Username:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
            </div>
            <div style={inputStyle}>
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
            </div>
            <button onClick={handleSubmit}>Submit</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default LoginPage;
