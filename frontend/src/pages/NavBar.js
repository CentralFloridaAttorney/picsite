import React from 'react';

const NavBar = () => {
    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const scrollToBottom = () => {
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    };

    const contactAlert = () => {
        alert('Call John at 850-321-3875'); // Display the alert with a clickable link
    };

    return (
        <nav style={navStyle}>
            <div style={containerStyle}>
                <a href="/" style={logoStyle}>Xyzzy Tool</a>
                <ul style={menuStyle}>
                    <li onClick={scrollToTop}>Top</li>
                    <li onClick={scrollToBottom}>Bottom</li>
                    <li onClick={contactAlert}>Contact</li>
                    {/* Add onClick handler for the "Contact" link */}
                </ul>
            </div>
        </nav>
    );
};

// CSS styles for the navigation bar
const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#333',
    color: '#fff',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', // Add a subtle shadow
    zIndex: 1000, // Ensure the navbar appears on top of other content
};

const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    maxWidth: '1200px', // Limit the width of the navbar
    margin: '0 auto', // Center the navbar horizontally
};

const logoStyle = {
    margin: 0,
    textDecoration: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 'bold', // Add some emphasis
    letterSpacing: '2px', // Increase letter spacing
};

const menuStyle = {
    listStyle: 'none',
    display: 'flex',
    gap: '1rem',
    cursor: 'pointer',
};

export default NavBar;