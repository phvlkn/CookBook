import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/header.jsx";
import Homepage from "./components/Homepage/Homepage.jsx";
import Loginpage from "./components/Loginpage/Loginpage.jsx";
import Profilepage from "./components/Profilepage/Profilepage.jsx";
import Upload from "./components/Upload/Upload.jsx";
import Register from "./components/Registerpage/Registerpage.jsx";
function App() {
  return (
    <Router>

      <Routes>
        <Route path="/login" element={<Loginpage />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/profile" element={<Profilepage />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
    );
}

export default App;

