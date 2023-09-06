import React, {useState} from 'react';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import BottomBar from "./components/BottomBar";
import PageTwo from "./pages/PageTwo";
import PageThree from "./pages/PageThree";
import PageFour from "./pages/PageFour";
import ImaginePage from "./pages/ImaginePage";
import PageOne from "./pages/PageOne";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activePage, setActivePage] = useState('Home'); // Default active page is 'Home'

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handlePageChange = (pageName) => {
        setActivePage(pageName);
    };

    return (
        <div>
            <NavBar/>
            {isLoggedIn ? (
                <div>
                    {activePage === 'Home' && <Home/>}
                    {activePage === 'PageOne' && <PageOne/>}
                    {activePage === 'Button 3' && <PageTwo/>}
                    {activePage === 'Button 4' && <PageFour/>}
                    {activePage === 'Button 5' && <ImaginePage/>}
                </div>
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess}/>
            )}
            <BottomBar onPageChange={handlePageChange}/>
        </div>
    );
};

export default App;
