import React from "react";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
require('crypto-browserify');

const App = () =>{
    return (
        <h1>
            Welcome to React App that's build using Webpack and Babel separately
            <Home/>
            <LoginPage/>
        </h1>
    )
}

export default App