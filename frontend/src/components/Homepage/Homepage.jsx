import React, { useState, useEffect } from "react";
import "./Homepage.css";
import Header from "../Header/Header.jsx";
import { ApiClient } from "../../utils/storage.js";
import { Link } from "react-router-dom";

function Homepage() {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async (query = "") => {
    setLoading(true);
    try {
      const data = query
        ? await ApiClient.searchRecipes(query, { skip: 0, limit: 50 })
        : await ApiClient.fetchRecipes({ skip: 0, limit: 50 });
      setRecipes(data);
    } catch (error) {
      console.error("Failed to fetch recipes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchRecipes(searchQuery);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
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
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>Загрузка...</p>
            </div>
          ) : recipes.length > 0 ? (
            recipes.map((recipe) => (
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
                  <p className="pin-time">⏱️ {recipe.cook_time} мин</p>
                  <div className="pin-rating">
                    ⭐ {recipe.rating_avg ? recipe.rating_avg.toFixed(1) : 'Нет оценок'}
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
