import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/header.jsx";
import Homepage from "./components/Homepage/Homepage.jsx";
import Loginpage from "./components/Loginpage/Loginpage.jsx";
import Profilepage from "./components/Profilepage/Profilepage.jsx";
import Upload from "./components/Upload/Upload.jsx";
import Register from "./components/Registerpage/Registerpage.jsx";
import NotFound from "./components/NotFound/NotFound.jsx";
import Recipe from "./components/Recipe/Recipe.jsx";

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/login" element={<Loginpage />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/profile/:id" element={<Profilepage />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipe/:id" element={<Recipe />} />

        {/* 404 страница */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
    );
}

export default App;

