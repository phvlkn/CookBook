import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ApiClient } from "../../utils/storage.js";
import "./Loginpage.css";

function Loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Функция входа
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await ApiClient.login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h1 className="title">
        <Link to="/" className="title-link">Поваренная<br/>книга</Link>
      </h1>

      <div className="login-form">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              type="password"
              placeholder="Пароль"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="login-btn" type="submit">
            Вход
          </button>
        </form>
        <Link to="/register" className="create-btn">
          Создать аккаунт
        </Link>
      </div>
    </div>
  );
}

export default Loginpage;
