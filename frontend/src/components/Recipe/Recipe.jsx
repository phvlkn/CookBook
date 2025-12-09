import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Recipe.css";
import Header from "../Header/Header.jsx";
import { ApiClient, ApiAuth } from "../../utils/storage.js";

function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const currentUser = ApiAuth.getCurrentUser();
  const isMounted = useRef(true);

  const refreshReviews = async (recipeId) => {
    if (!recipeId) return [];
    try {
      const data = await ApiClient.fetchReviews(recipeId);
      const enriched = await Promise.all(
        data.map(async (review) => ({
          ...review,
          author: await ApiClient.fetchUserById(review.user_id).catch(() => null),
        }))
      );
      if (isMounted.current) {
        setReviews(enriched);
      }
      return enriched;
    } catch (err) {
      console.error("Failed to load reviews", err);
      if (isMounted.current) {
        setReviews([]);
      }
      return [];
    }
  };

  useEffect(() => {
    isMounted.current = true;
    const recipeId = parseInt(id);
    const loadRecipe = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await ApiClient.fetchRecipe(recipeId);
        if (!isMounted.current) return;
        setRecipe(data);
        if (data?.author_id) {
          try {
            const fetchedAuthor = await ApiClient.fetchUserById(data.author_id);
            if (isMounted.current) {
              setAuthor(fetchedAuthor);
            }
          } catch (authorError) {
            console.warn("Failed to load author", authorError);
          }
        }
        await refreshReviews(recipeId);
      } catch (err) {
        console.error("Failed to load recipe", err);
        if (isMounted.current) {
          setRecipe(null);
          setLoadError(err.message || "Не удалось загрузить рецепт");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    loadRecipe();
    return () => {
      isMounted.current = false;
    };
  }, [id]);

  const handleAddReview = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser) {
      setError("Вы должны войти, чтобы оставить отзыв");
      return;
    }
    if (!recipe) {
      setError("Сначала загрузите рецепт");
      return;
    }

    ApiClient.addReview(recipe.id, { rating: newRating, comment: newComment })
      .then(() => refreshReviews(recipe.id))
      .then(() => {
        setNewRating(5);
        setNewComment("");
        setSuccess("Отзыв успешно добавлен!");
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((err) => {
        console.error('Error adding review:', err);
        setError(err.message);
      });
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

  if (!recipe) {
    return (
      <>
        <Header />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>{loadError || 'Рецепт не найден'}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="recipe-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Назад
        </button>

        <div className="recipe-header">
          <img
            src={recipe.image || `https://picsum.photos/500/400?random=${recipe.id}`}
            alt={recipe.title}
            onError={(e) => {
              e.target.src = `https://picsum.photos/500/400?random=${recipe.id}`;
            }}
            className="recipe-image"
          />

          <div className="recipe-info">
            <h1>{recipe.title}</h1>
            <p className="recipe-description">{recipe.description}</p>

            <div className="recipe-meta">
              <span className="meta-item">📁 {recipe.category}</span>
              <span className="meta-item">⏱️ {recipe.cook_time} минут</span>
              <span className="meta-item">
                ⭐ {recipe.rating_avg ? recipe.rating_avg.toFixed(1) : 'Нет оценок'} ({reviews.length} отзывов)
              </span>
            </div>

            {author && (
              <div className="author-info">
                <p>
                  Автор: <strong>{author.username}</strong>
                </p>
                <button
                  className="author-link"
                  onClick={() => navigate(`/profile/${author.id}`)}
                >
                  Посмотреть профиль
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="recipe-content">
          <div className="ingredients-section">
            <h2>Ингредиенты</h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>
                  <strong>{ing.name}</strong> – {ing.quantity} {ing.unit}
                </li>
              ))}
            </ul>
          </div>

          <div className="steps-section">
            <h2>Шаги приготовления</h2>
            <ol className="steps-list">
              {recipe.steps && recipe.steps.map((step, idx) => (
                <li key={idx}>{step.text}</li>
              ))}
            </ol>
          </div>
        </div>

          <div className="reviews-section">
          <h2>Отзывы ({reviews.length})</h2>

          {currentUser && (
            <form onSubmit={handleAddReview} className="review-form">
              <h3>Добавить отзыв</h3>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-group">
                <label>Оценка (1-5):</label>
                <select value={newRating} onChange={(e) => setNewRating(parseInt(e.target.value))}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} ⭐</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Комментарий:</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Поделитесь вашим мнением..."
                  rows={3}
                />
              </div>

              <button type="submit" className="btn-submit">
                Отправить отзыв
              </button>
            </form>
          )}

          {!currentUser && (
            <p style={{ color: '#999', padding: '20px', textAlign: 'center' }}>
              <button className="link-btn" onClick={() => navigate('/login')}>
                Войдите
              </button>
              {' '} чтобы оставить отзыв
            </p>
          )}

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review, idx) => {
                const reviewer = review.author;
                return (
                  <div key={idx} className="review-item">
                    <div className="review-header">
                      <div className="review-author">
                        {reviewer && (
                          <>
                            <img src={reviewer.avatar || '/default-avatar.png'} alt={reviewer.username} className="review-avatar" />
                            <span className="review-username">{reviewer.username}</span>
                          </>
                        )}
                      </div>
                      <div className="review-meta">
                        <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                    {review.comment && <p className="review-comment">{review.comment}</p>}
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                Отзывов пока нет. Будьте первым!
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Recipe;
