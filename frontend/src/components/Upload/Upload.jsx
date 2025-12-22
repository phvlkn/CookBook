import React, { useState } from "react";
import Header from "../Header/Header.jsx";
import "./Upload.css";
import { useNavigate } from "react-router-dom";
import { ApiClient, ApiAuth } from "../../utils/storage.js";

function Upload() {
  const navigate = useNavigate();
  const currentUser = ApiAuth.getCurrentUser();

  // Redirect if not logged in
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Завтрак");
  const [cookTime, setCookTime] = useState(30);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [ingredients, setIngredients] = useState([{ name: "", quantity: 1, unit: "г" }]);
  const [steps, setSteps] = useState([{ order: 1, text: "" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 1, unit: "г" }]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, { order: steps.length + 1, text: "" }]);
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index].text = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!title.trim()) {
      setError("Укажите название рецепта");
      return;
    }
    if (!description.trim()) {
      setError("Укажите описание рецепта");
      return;
    }
    if (ingredients.some((ing) => !ing.name.trim())) {
      setError("Все ингредиенты должны иметь название");
      return;
    }
    if (steps.some((step) => !step.text.trim())) {
      setError("Все шаги должны содержать описание");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      cook_time: parseInt(cookTime, 10) || 0,
      category,
      steps: steps.map((step, index) => ({ order: index + 1, text: step.text.trim() })),
      ingredients: ingredients.map((ing) => ({
        name: ing.name.trim(),
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit,
      })),
    };
    if (imageUrl && !imageFile) {
      payload.image = imageUrl;
    }

    try {
      const created = await ApiClient.uploadRecipe(payload, imageFile);
      setSuccess("✅ Рецепт опубликован! Перенаправляем...");
      setTimeout(() => {
        navigate(`/recipe/${created.id}`);
      }, 1000);
    } catch (err) {
      setError(err.message || "Ошибка при сохранении рецепта");
    }
  };

  const categories = ["Завтрак", "Обед", "Ужин", "Десерт", "Салат", "Суп", "Паста", "Мясо", "Пицца"];
  const units = ["г", "мл", "шт", "стакан", "ложка", "щепотка", "кг"];

  return (
    <>
      <Header />
      <div className="upload-container">
        <h1>📝 Создать рецепт</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          {/* ОСНОВНАЯ ИНФОРМАЦИЯ */}
          <div className="form-section">
            <div className="section-title">🍽️ Основная информация</div>

            <div className="field">
              <label className="label-title">Название рецепта *</label>
              <input
                type="text"
                className="text-input"
                placeholder="Например: Паста Карбонара"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label-title">Описание *</label>
              <textarea
                className="text-input"
                placeholder="Расскажите о вашем рецепте..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="field">
                <label className="label-title">Категория</label>
                <select
                  className="text-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label-title">Время приготовления (мин)</label>
                <input
                  type="number"
                  className="text-input"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="field">
                <label className="label-title">Ссылка на изображение</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageFile(null);
                  }}
                />
              </div>
            </div>

            <div className="field">
              <label className="label-title">Или загрузите фото</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-input"
              />
            </div>

            {imageUrl && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ marginBottom: '8px' }}>Предпросмотр:</p>
                <img
                  src={imageUrl}
                  alt="preview"
                  className="image-preview"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* ИНГРЕДИЕНТЫ */}
          <div className="form-section">
            <div className="section-title">🥘 Ингредиенты</div>

            {ingredients.map((ing, index) => (
              <div key={index} className="ingredient-row">
                <input
                  type="text"
                  placeholder="Название ингредиента"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Количество"
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(index, "quantity", parseFloat(e.target.value))}
                  min="0.1"
                  step="0.1"
                />
                <select
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="remove-btn"
                  >
                    ✕ Удалить
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddIngredient}
              className="add-ingredient-btn"
            >
              + Добавить ингредиент
            </button>
          </div>

          {/* ШАГИ */}
          <div className="form-section">
            <div className="section-title">👨‍🍳 Шаги приготовления</div>

            {steps.map((step, index) => (
              <div key={index} className="step-row">
                <span style={{
                  fontWeight: '700',
                  color: '#ff6b6b',
                  marginTop: '14px',
                  minWidth: '30px',
                  fontSize: '1.1rem'
                }}>
                  {index + 1}.
                </span>
                <textarea
                  placeholder="Описание шага приготовления..."
                  value={step.text}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  required
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(index)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddStep}
              className="add-step-btn"
            >
              + Добавить шаг
            </button>
          </div>

          {/* КНОПКА ОТПРАВКИ */}
          <button type="submit" className="submit-btn">
            🚀 Опубликовать рецепт
          </button>
        </form>
      </div>
    </>
  );
}

export default Upload;
