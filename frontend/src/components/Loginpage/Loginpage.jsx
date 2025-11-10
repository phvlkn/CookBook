import React from "react";
import "./Loginpage.css";

function Loginpage() {
  return (
    <div className="login-container">
      <h1 className="title">
        <a href="/" className="title-link">Recipes</a>
      </h1>

      <div className="login-form">
        <input type="email" placeholder="email" className="input-field" />
        <div className="password-container">
          <input type="password" placeholder="password" className="input-field" />
          <a href="#" className="forgot-link">forgot password?</a>
        </div>

        <button className="login-btn">Login</button>
        <button className="create-btn">Create account</button>
      </div>
    </div>
  );
}

export default Loginpage;
