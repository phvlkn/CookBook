import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/header.jsx";
import "./Profilepage.css";
import { UserStorage, RecipeStorage } from "../../utils/storage.js";

function Profilepage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = UserStorage.getCurrentUser();

  useEffect(() => {
    // Find user by ID
    const userId = parseInt(id);
    const allUsers = UserStorage.getUsers();
    const foundUser = allUsers.find(u => u.id === userId);

    if (!foundUser) {
      navigate("/");
      return;
    }

    setUser(foundUser);

    // Get user's recipes
    const recipes = RecipeStorage.getRecipesByUser(userId);
    setUserRecipes(recipes);
    setLoading(false);
  }, [id, navigate]);

  const handleDeleteRecipe = (recipeId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот рецепт?")) {
      RecipeStorage.deleteRecipe(recipeId);
      setUserRecipes(userRecipes.filter(r => r.id !== recipeId));
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Загрузка...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Пользователь не найден</p>
        </div>
      </>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <img className="profile-avatar" src={user.avatar} alt={user.username} />
          <div className="profile-info">
            <h2 className="profile-name">{user.username}</h2>
            <p className="profile-email">{user.email}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            <p className="profile-stats">Рецептов: {userRecipes.length}</p>
          </div>
        </div>

        <div className="recipes-section">
          <h3>Мои рецепты ({userRecipes.length})</h3>

          {userRecipes.length > 0 ? (
            <div className="recipes-grid">
              {userRecipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card">
                  <a href={`/recipe/${recipe.id}`} className="recipe-link">
                    <img
                      src={recipe.image || `/recipe-images/${recipe.title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                      alt={recipe.title}
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/300/400?random=${recipe.id}`;
                      }}
                    />
                  </a>
                  <div className="recipe-details">
                    <h4>{recipe.title}</h4>
                    <p>{recipe.category} • ⏱️ {recipe.cookTime} мин</p>
                    <p className="recipe-rating">⭐ {recipe.rating ? recipe.rating.toFixed(1) : 'Нет оценок'}</p>
                    {isOwnProfile && (
                      <div className="recipe-actions">
                        <button
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                          className="btn-view"
                        >
                          Просмотр
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="btn-delete"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>У этого пользователя пока нет рецептов</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profilepage;
