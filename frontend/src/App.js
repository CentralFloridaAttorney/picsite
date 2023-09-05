import React, {useState} from 'react';
import NavBar from './pages/NavBar'; // Don't forget to import your NavBar component
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    return (
        <div>
            <NavBar/> {/* NavBar is placed here so it appears on all pages */}
            {isLoggedIn ? <Home/> : <LoginPage onLoginSuccess={handleLoginSuccess}/>}
        </div>
    );
};

export default App;
