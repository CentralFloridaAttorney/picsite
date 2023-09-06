import React, { useEffect, useState } from 'react';
import axios from 'axios';
const BACKEND_URL = `http://0.0.0.0:50011`;
//const BACKEND_URL = `http://71.42.29.18:50011`;

// Function to set a cookie
const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const PageFour = () => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Extract the access token and username from the cookie
    const access_token = document.cookie.split('access_token=')[1]?.split(';')[0];
    const usernameFromCookie = document.cookie.split('username=')[1]?.split(';')[0];

    const fetchId = async () => {
      try {
        // Define API URL
        const apiUrl = `${BACKEND_URL}/api/validate-token`;

        // Make the GET request
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Username': usernameFromCookie  // Send the username along with the request
          }
        });

        const data = response.data;

        // If the request is successful, set the userId and username state variables
        if (data.success) {
          setUserId(data.id);
          setUsername(data.username);
          setCookie('username', data.username, 1);
        }

      } catch (error) {
        // Log any errors
        console.error('An error occurred:', error);
      }
    };

    // Invoke the fetchId function
    fetchId();
  }, []);  // The empty dependency array means this useEffect runs once when the component mounts

  return (
    <div>
      <h1>Home Page</h1>
      <img src="default.png" alt="Default" />
      {userId && <p>Welcome, your ID is {userId}</p>}
    </div>
  );
};

export default PageFour;
