import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Registerpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    setError("");
    setSuccess("");

    // Проверка заполнения
    if (!email || !password || !confirm) {
      setError("Заполните все поля");
      return;
    }

    // Проверка совпадения паролей
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    // Получаем существующих пользователей
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Проверка, есть ли пользователь с таким email
    const exists = users.some((u) => u.email === email);
    if (exists) {
      setError("Пользователь с таким email уже существует");
      return;
    }

    // Добавляем нового пользователя
    const newUser = { email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    setSuccess("Аккаунт успешно создан! Теперь войдите.");
    setTimeout(() => navigate("/login"), 1500);
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

        <input
          type="password"
          placeholder="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="confirm password"
          className="input-field"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
        {success && <p className="success-message" style={{ color: "green" }}>{success}</p>}

        <button className="login-btn" onClick={handleRegister}>
          Create account
        </button>
        <button className="create-btn" onClick={() => navigate("/login")}>
          Back to login
        </button>
      </div>
    </div>
  );
}

export default Registerpage;
