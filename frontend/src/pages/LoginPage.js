import React, { useState } from 'react';
require('crypto-browserify')
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const REACT_APP_SERVER_HOST = process.env.REACT_APP_SERVER_HOST
  const REACT_APP_SERVER_PORT = process.env.REACT_APP_SERVER_PORT

  // Define server URL based on environment variables
  const serverURL = `http://${REACT_APP_SERVER_HOST}:${REACT_APP_SERVER_PORT}`;

  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      const response = await fetch(`${serverURL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store access_token as a cookie
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

  return (
    <div>
      <h1>Login Page</h1>
      <div>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>
      <div>
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
