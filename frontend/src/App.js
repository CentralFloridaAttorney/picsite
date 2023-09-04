import React from "react";
import Home from "./pages/Home";
import TestDBPage from "./pages/TestDBPage";

const App = () =>{
    return (
        <h1>
            Welcome to React App that's build using Webpack and Babel separately
            <Home/>
            <TestDBPage/>
        </h1>
    )
}

export default App