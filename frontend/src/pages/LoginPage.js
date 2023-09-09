import React, {useState} from 'react';
import PropTypes from 'prop-types';

const BACKEND_URL = `http://localhost:53999`;

const LoginPage = ({onLoginSuccess}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            });

            const data = await response.json();

            if (data.success) {
                // Store the access_token as a cookie
                document.cookie = `access_token=${data.access_token};path=/`;

                // Store the username as a cookie
                document.cookie = `username=${username};path=/`;

                setMessage('Login successful');
                onLoginSuccess(); // Call onLoginSuccess
            } else {
                setMessage('Invalid credentials');
            }
        } catch (error) {
            console.error('There was an error sending the request', error);
            setMessage('An error occurred');
        }
    };

    // Inline styles
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

LoginPage.propTypes = {
    onLoginSuccess: PropTypes.func.isRequired,
};

export default LoginPage;
