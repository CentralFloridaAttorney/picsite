import React, {useState} from 'react';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import BottomBar from "./components/BottomBar";
import PageTwo from "./pages/PageTwo";
import PageFour from "./pages/PageFour";
import ImaginePage from "./pages/ImaginePage";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activePage, setActivePage] = useState('Home'); // Default active page is 'Home'

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const renderPage = () => {
        switch (activePage) {
            case 'LoginPage':
                return <LoginPage onLoginSuccess={handleLoginSuccess}/>;
            case 'Home':
                return <Home/>;
            case 'Button 3':
                return <PageTwo/>;
            case 'Button 4':
                return <PageFour/>;
            case 'ImaginePage':
                return <ImaginePage/>;
            default:
                return <Home/>; // Default to Home page
        }
    };

    const handlePageChange = (pageName) => {
        setActivePage(pageName);
    };

    return (
        <div>
            <NavBar/>
            {isLoggedIn ? (
                <div>
                    {renderPage()} {/* Render the current page */}
                </div>
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess}/>
            )}
            <BottomBar onPageChange={handlePageChange}/>
        </div>
    );
};

export default App;
