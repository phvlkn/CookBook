import React, { useState, useEffect, useRef } from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";

const defaultAvatar = "/default-avatar.png";

function Header() {
  const [query, setQuery] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
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
    localStorage.removeItem("loggedInUser");
    setLoggedUser(null);
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="header">
      <a href="/">
        <h1 className="logo">Recipes</h1>
      </a>

      <form className="search" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
  Upload
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
                navigate(`/profile/${loggedUser.email}`);
                setMenuOpen(false);
              }}
            >
              Профиль
            </button>

            <button className="avatar-menu-item logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
