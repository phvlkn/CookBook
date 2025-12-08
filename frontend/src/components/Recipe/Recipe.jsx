import React from "react";
import "./Recipe.css";
import Header from "../Header/header.jsx";
import { useParams, useNavigate } from "react-router-dom";

function Recipe() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  // временные данные (пока нет API)
  const recipe = {
    id,
    title: "Creamy Garlic Pasta",
    image: "https://source.unsplash.com/800x600/?pasta,food",
    time: "25 min",
    level: "Easy",
    author: "chef",
    ingredients: [
      "200g pasta",
      "2 tbsp butter",
      "3 cloves garlic",
      "200ml cream",
      "Parmesan",
      "Salt, pepper",
    ],
    steps: [
      "Cook pasta until al dente.",
      "Melt butter and sauté garlic.",
      "Add cream, simmer 2 minutes.",
      "Add pasta, mix and season.",
      "Serve with parmesan.",
    ],
  };

  return (
    <>
      <Header />
      <div className="recipe-container">
        
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="recipe-card">
          <img className="recipe-image" src={recipe.image} alt={recipe.title} />

          <div className="recipe-content">
            <h1 className="recipe-title">{recipe.title}</h1>

            <div className="meta">
              <span>⏱ {recipe.time}</span>
              <span>🔥 {recipe.level}</span>
              <span>👨‍🍳 {recipe.author}</span>
            </div>

            <h2>Ingredients</h2>
            <ul className="ingredient-list">
              {recipe.ingredients.map((i, idx) => (
                <li key={idx}>• {i}</li>
              ))}
            </ul>

            <h2>Steps</h2>
            <ol className="steps-list">
              {recipe.steps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>

            <div className="actions">
              <button className="act-btn">❤️ Like</button>
              <button className="act-btn">⭐ Save</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Recipe;
