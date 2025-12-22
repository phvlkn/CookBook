import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ApiClient } from "../../utils/storage.js";

function Registerpage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("/default-avatar.png");
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Проверка заполнения
    if (!email || !username || !password || !confirm) {
      setError("Заполните все поля");
      return;
    }

    // Проверка совпадения паролей
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      let avatarUrl = null;
      if (avatarFile) {
        const uploadResult = await ApiClient.uploadAvatar(avatarFile);
        avatarUrl = uploadResult.url;
      }
      await ApiClient.register({
        email,
        username,
        password,
        avatar: avatarUrl,
      });
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
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Имя пользователя"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Подтвердите пароль"
            className="input-field"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.9rem' }}>
              Загрузить аватарку (опционально)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            {avatarPreview !== "/default-avatar.png" && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img src={avatarPreview} alt="preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
          {success && <p className="success-message" style={{ color: "green" }}>{success}</p>}

          <button className="login-btn" type="submit">
            Создать аккаунт
          </button>
        </form>
        <Link to="/login" className="create-btn">
          Вернуться к входу
        </Link>
      </div>
    </div>
  );
}

export default Registerpage;
