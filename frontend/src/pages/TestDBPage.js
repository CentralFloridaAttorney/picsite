import React, { useState } from 'react';
import axios from 'axios';

const TestDBPage = () => {
  // Local state to store the result from the API
  const [result, setResult] = useState(null);

  // Local state to store input from the textfield
  const [inputValue, setInputValue] = useState('');

  // Function to call the testdb route
  const testDatabaseConnection = () => {
    // Make an API call to the server's /testdb route
    axios.get('http://localhost:3000/testdb')
      .then(response => {
        // Update the result state with the API response
        setResult(response.data);
      })
      .catch(error => {
        // Handle any errors
        console.error('There was an error with the API call: ', error);
      });
  };

  return (
    <div style={{ margin: '20px' }}>
      <h1>Test Database Connection</h1>
      {/* Textfield to take user input */}
      <input
        type="text"
        placeholder="Your input here"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      {/* Button to trigger the API call */}
      <button onClick={testDatabaseConnection}>
        Test Connection
      </button>

      {/* Display the API response */}
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>API Response</h2>
          <p><strong>Message:</strong> {result.message}</p>
          <p><strong>Solution:</strong> {result.solution}</p>
        </div>
      )}
    </div>
  );
};

export default TestDBPage;
