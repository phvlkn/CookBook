import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header.jsx";
import "./Profilepage.css";
import { ApiClient, ApiAuth } from "../../utils/storage.js";

function Profilepage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const currentUser = ApiAuth.getCurrentUser();

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const userId = parseInt(id);
        const [userData, recipes] = await Promise.all([
          ApiClient.fetchUserById(userId),
          ApiClient.fetchUserRecipes(userId, { skip: 0, limit: 50 }),
        ]);
        if (!mounted) return;
        setUser(userData);
        setUserRecipes(recipes);
      } catch (err) {
        console.error("Failed to load profile", err);
        if (mounted) {
          setUser(null);
          setLoadError(err.message || "Пользователь не найден");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот рецепт?")) {
      return;
    }
    try {
      await ApiClient.deleteRecipe(recipeId);
      setUserRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (err) {
      console.error("Failed to delete recipe", err);
      alert(err.message || "Не удалось удалить рецепт");
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
          <p>{loadError || 'Пользователь не найден'}</p>
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
                    <p>{recipe.category} • ⏱️ {recipe.cook_time} мин</p>
                    <p className="recipe-rating">⭐ {recipe.rating_avg ? recipe.rating_avg.toFixed(1) : 'Нет оценок'}</p>
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
