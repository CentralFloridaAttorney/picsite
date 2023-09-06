import React, {useEffect, useState} from 'react';
import axios from 'axios';

const BACKEND_URL = `http://0.0.0.0:50011`;

// Function to set a cookie
const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
};

const ImaginePage = () => {
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

    const handleImageGeneration = async () => {
        try {
            // Define the parameters you want to pass to the Python function
            const requestData = {
                seed: -1,
                prompt: "a photograph of a cute puppy",
                file_identifier: "puppy",
                height: 312,
                width: 312,
                inference_steps: 50,
                prompt_strength: 10.0,
                multiple: false,
                collection_name: "imagetool",
            };

            // Make a POST request to the backend with the parameters in the request body
            const response = await axios.post(`${BACKEND_URL}/api/generate-image`, requestData);

            // Handle the response here (e.g., display a success message)
            console.log('Image generation successful:', response.data);

        } catch (error) {
            // Handle errors (e.g., display an error message)
            console.error('Image generation failed:', error);
        }
    };


    return (
        <div>
            <h1>Imagine Page</h1>
            <img src="default.png" alt="Default"/>
            <p>This is me!</p>
            {userId && <p>Welcome, your ID is {userId}</p>}
            <button onClick={handleImageGeneration}>Generate Image</button>
        </div>
    );
};

export default ImaginePage;
