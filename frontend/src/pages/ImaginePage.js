import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = `http://localhost:53999`;

const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
};

const ImaginePage = () => {
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState('');
    const [imageGenerationOutput, setImageGenerationOutput] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const access_token = document.cookie.split('access_token=')[1]?.split(';')[0];
                const usernameFromCookie = document.cookie.split('username=')[1]?.split(';')[0];

                const apiUrl = `${BACKEND_URL}/api/validate-token`;
                const response = await axios.get(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Username': usernameFromCookie
                    }
                });

                const data = response.data;

                if (data.success) {
                    setUserId(data.id);
                    setUsername(data.username);
                    setCookie('username', data.username, 1);
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleImageGeneration = async () => {
        try {
            const requestData = {
                seed: -1,
                prompt: "a photograph of a cute puppy",
                file_identifier: "puppy",
                height: 312,
                width: 312,
                inference_steps: 5,
                prompt_strength: 10.0
            };

            const response = await axios.post(`${BACKEND_URL}/api/generate-image`, requestData);

            if (response.data.success) {
                setImageGenerationOutput(response.data.output);
                console.log('Image generation successful:', response.data);
            } else {
                console.error('Image generation failed. Server response:', response.data);
            }
        } catch (error) {
            console.error('An error occurred during image generation:', error);
        }
    };

    return (
        <div>
            <h1>Imagine Page</h1>
            <img src="default.png" alt="Default"/>
            <p>This is me!</p>
            {username && <p>Welcome, your ID is {username}</p>}
            <button onClick={handleImageGeneration}>Generate Image</button>

            {imageGenerationOutput && (
                <div>
                    <h2>Image Generation Output:</h2>
                    <pre>{imageGenerationOutput}</pre>
                </div>
            )}
        </div>
    );
};

export default ImaginePage;
