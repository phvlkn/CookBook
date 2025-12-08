import React, { useState, useEffect, useRef } from "react";
import "./Homepage.css";
import Header from "../Header/header.jsx";
import { RecipeStorage } from "../../utils/storage.js";
import { Link } from "react-router-dom";

function Homepage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load recipes from localStorage
    const allRecipes = RecipeStorage.getRecipes();
    console.log('📋 Loaded recipes:', allRecipes.length, allRecipes);
    setRecipes(allRecipes);
    setFilteredRecipes(allRecipes);
  }, []);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredRecipes(recipes);
    } else {
      const results = RecipeStorage.searchRecipes(query);
      setFilteredRecipes(results);
    }
  };

  // Generate consistent placeholder image for recipe
  const getPlaceholderImage = (recipeId) => {
    // Use a consistent image based on recipe ID (not random)
    const imageId = recipeId % 10 + 1; // Cycle through 10 different images
    return `https://picsum.photos/400/300?sig=${imageId}`;
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <div className="container">
        <h1>Рецепты</h1>
        <div className="grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="pin">
                <Link to={`/recipe/${recipe.id}`}>
                  <img
                    src={recipe.image || getPlaceholderImage(recipe.id)}
                    alt={recipe.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = getPlaceholderImage(recipe.id);
                    }}
                  />
                </Link>
                <div className="pin-content">
                  <h3>{recipe.title}</h3>
                  <p className="pin-category">{recipe.category}</p>
                  <p className="pin-time">⏱️ {recipe.cookTime} мин</p>
                  <div className="pin-rating">
                    ⭐ {recipe.rating ? recipe.rating.toFixed(1) : 'Нет оценок'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>Рецептов не найдено</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Homepage;
