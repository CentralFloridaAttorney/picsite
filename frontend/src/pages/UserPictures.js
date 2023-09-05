import React, {useEffect, useState} from 'react';

const UserPictures = () => {
    const [filenames, setFilenames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFilenames = async () => {
            try {
                // Retrieve the UUID from the cookie
                const access_token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('access_token='))
                    .split('=')[1];

                // Fetch filenames from the server
                const response = await fetch(`http://localhost:55055/api/filenames`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({access_token}),
                });

                const data = await response.json();
                if (data.success) {
                    setFilenames(data.filenames);
                } else {
                    // Handle errors
                    console.error('Could not fetch filenames');
                }
            } catch (error) {
                console.error('There was an error sending the request', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilenames();
    }, []);

    // Define inline styles
    const listStyle = {
        listStyleType: 'none',
        padding: '0',
    };

    return (
        <div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <h3>Your Pictures</h3>
                    <ul style={listStyle}>
                        {filenames.map((filename, index) => (
                            <li key={index}>{filename}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default UserPictures;
