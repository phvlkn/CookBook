import React, { useState } from "react";
import Header from "../Header/header.jsx";
import "./Profilepage.css";

function Profilepage() {
  // данные пользователя (в будущем можно получать из API)
  const user = {
    name: "Nikita",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  };

  // добавленные и сохранённые рецепты
  const [myRecipes] = useState([
    { id: 1, title: "Pasta Carbonara", image: "https://picsum.photos/300/250?random=1" },
    { id: 2, title: "Avocado Toast", image: "https://picsum.photos/300/250?random=2" },
  ]);

  const [savedRecipes] = useState([
    { id: 3, title: "Smoothie Bowl", image: "https://picsum.photos/300/250?random=3" },
    { id: 4, title: "Tomato Soup", image: "https://picsum.photos/300/250?random=4" },
  ]);

  // вкладки: "мои" и "сохранённые"
  const [activeTab, setActiveTab] = useState("my");

  const recipesToShow = activeTab === "my" ? myRecipes : savedRecipes;

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <img className="profile-avatar" src={user.avatar} alt="avatar" />
          <h2 className="profile-name">{user.name}</h2>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
            onClick={() => setActiveTab("my")}
          >
            Мои рецепты
          </button>
          <button
            className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            Сохранённые
          </button>
        </div>

        <div className="recipes-grid">
          {recipesToShow.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} />
              <p>{recipe.title}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Profilepage;
