import React, { useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
const avatar = null; 
function Header() {
  const [query, setQuery] = useState("");

  // Функция отправки запроса
  const handleSearch = async (e) => {
    e.preventDefault(); // не перезагружать страницу

    if (!query.trim()) return; // если пусто — ничего не делаем

    try {
      // Отправляем запрос (POST)
      const response = await fetch("https://your-api.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search: query }),
      });

      if (!response.ok) throw new Error("Ошибка при запросе");

      const data = await response.json();
      console.log("Результаты поиска:", data);
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }

    // ❌ Не очищаем строку — текст остаётся
    // setQuery("");
  };

  return (
    <header className="header">
      <a href="/">
        <h1 className="logo">Recipes</h1>
      </a>

      <form className="search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="actions">
        {/* <button className="add-btn" onClick={() => navigate("/upload")}>Upload</button> */}
        <Link to="/upload" className="add-btn">Upload</Link>
        <a href="/login">
          <img
            className="profile-img"
            src={avatar}
          />
        </a>
      </div>
    </header>
  );
}

export default Header;
