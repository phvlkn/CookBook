import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { UserStorage } from "../../utils/storage.js";

const defaultAvatar = "/default-avatar.png";

function Header({ onSearch }) {
  const [query, setQuery] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = UserStorage.getCurrentUser();
    setLoggedUser(user);
  }, []);

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAvatarClick = () => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }
    setMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    UserStorage.logout();
    setLoggedUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <header className="header">
      <Link to="/">
        <h1 className="logo">Поваренная<br/>книга</h1>
      </Link>

      <form className="search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Поиск рецептов..."
          value={query}
          onChange={handleSearch}
        />
      </form>

      <div className="actions" ref={menuRef}>
        <button
  className="add-btn"
  onClick={() => {
    if (loggedUser) {
      navigate("/upload");
    } else {
      navigate("/login");
    }
  }}
>
  Добавить рецепт
</button>


        <button onClick={handleAvatarClick} className="avatar-btn">
          <img
            className="profile-img"
            src={loggedUser?.avatar || defaultAvatar}
            alt="profile"
          />
        </button>

        {menuOpen && loggedUser && (
          <div className="avatar-menu">
            <button
              className="avatar-menu-item"
              onClick={() => {
                navigate(`/profile/${loggedUser.id}`);
                setMenuOpen(false);
              }}
            >
              Профиль
            </button>

            <button className="avatar-menu-item logout" onClick={handleLogout}>
              Выход
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
