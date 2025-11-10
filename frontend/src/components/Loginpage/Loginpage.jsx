import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loginpage.css";

function Loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Функция входа
  const handleLogin = () => {
    // Получаем сохранённых пользователей из localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Проверяем, существует ли пользователь
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Сохраняем информацию о входе
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      setError("");

      // Перенаправление на страницу профиля
      navigate(`/profile/${user.email}`);
    } else {
      setError("Неверный email или пароль");
    }
  };

  // Переход на страницу регистрации
  const handleCreateAccount = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <h1 className="title">
        <a href="/" className="title-link">Recipes</a>
      </h1>

      <div className="login-form">
        <input
          type="email"
          placeholder="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-container">
          <input
            type="password"
            placeholder="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="#" className="forgot-link">forgot password?</a>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
        <button className="create-btn" onClick={handleCreateAccount}>
          Create account
        </button>
      </div>
    </div>
  );
}

export default Loginpage;
