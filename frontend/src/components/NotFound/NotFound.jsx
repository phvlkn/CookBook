import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/" className="home-link">Homepage</Link>
    </div>
  );
}

export default NotFound;
