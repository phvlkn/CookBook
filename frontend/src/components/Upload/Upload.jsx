import React, { useState } from "react";
import Header from "../Header/header.jsx";
import "./Upload.css";
import { useNavigate } from "react-router-dom";

function Upload() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [finishedImage, setFinishedImage] = useState(null); // file
  const [finishedPreview, setFinishedPreview] = useState(null); // url
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [time, setTime] = useState(30); // minutes

  const [steps, setSteps] = useState([
    { id: Date.now(), text: "", image: null, preview: null },
  ]);

  // Обработка изображения готового блюда
  const handleFinishedImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFinishedImage(file);
    setFinishedPreview(URL.createObjectURL(file));
  };

  // Ингредиенты
  const addIngredient = () => {
    const val = ingredientInput.trim();
    if (!val) return;
    setIngredients((prev) => [...prev, val]);
    setIngredientInput("");
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Шаги
  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text: "", image: null, preview: null },
    ]);
  };

  const removeStep = (id) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleStepChange = (id, field, value) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleStepImage = (id, file) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, image: file, preview: file ? URL.createObjectURL(file) : null } : s
      )
    );
  };

  // Сохранение/публикация рецепта (пример — сохраняем в localStorage и выводим в консоль)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Добавьте название рецепта");
      return;
    }

    const recipe = {
      id: Date.now(),
      title,
      ingredients,
      time,
      steps: steps.map((s, i) => ({
        order: i + 1,
        text: s.text,
        // NOTE: для реальной загрузки на сервер нужно отправлять файлы через FormData.
        imageName: s.image ? s.image.name : null,
      })),
      finishedImageName: finishedImage ? finishedImage.name : null,
      createdAt: new Date().toISOString(),
    };

    // Пример локального сохранения: собираем все рецепты в localStorage
    const stored = JSON.parse(localStorage.getItem("recipes") || "[]");
    stored.unshift(recipe);
    localStorage.setItem("recipes", JSON.stringify(stored));

    console.log("Сохранён рецепт (заглушка):", recipe);

    // Если хочешь отправить на сервер — пример (раскомментируй и доработай URL):
    /*
    const formData = new FormData();
    formData.append("title", title);
    formData.append("time", time);
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("finishedImage", finishedImage);
    steps.forEach((s, idx) => {
      formData.append(`steps[${idx}][text]`, s.text);
      if (s.image) formData.append(`steps[${idx}][image]`, s.image);
    });

    try {
      const res = await fetch("https://your-api.com/recipes", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Ошибка при отправке");
      const data = await res.json();
      console.log("Ответ сервера:", data);
    } catch (err) {
      console.error(err);
    }
    */

    // После сохранения можно перейти на страницу профиля:
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    } else {
      // если пользователь не в системе — на главную
      navigate("/");
    }
  };

  return (
    <>
      <Header />
      <div className="upload-container">
        <h1>Создать рецепт</h1>

        <form className="upload-form" onSubmit={handleSubmit}>
          {/* Название */}
          <label className="field">
            <span className="label-title">Название</span>
            <input
              type="text"
              className="text-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название рецепта"
            />
          </label>

          {/* Готовое блюдо */}
          <label className="field">
            <span className="label-title">Фото готового блюда</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFinishedImage}
            />
            {finishedPreview && (
              <div className="image-preview">
                <img src={finishedPreview} alt="finished preview" />
              </div>
            )}
          </label>

          {/* Ингредиенты */}
          <div className="field">
            <span className="label-title">Ингредиенты</span>
            <div className="ingredient-row">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="Добавить ингредиент"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
              />
              <button type="button" className="add-small" onClick={addIngredient}>
                Добавить
              </button>
            </div>

            <ul className="ingredient-list">
              {ingredients.map((ing, i) => (
                <li key={i} className="ingredient-item">
                  <span>{ing}</span>
                  <button
                    type="button"
                    className="remove-small"
                    onClick={() => removeIngredient(i)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Время */}
          <label className="field">
            <span className="label-title">Время приготовления: {time} мин</span>
            <input
              type="range"
              min="1"
              max="300"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
            />
          </label>

          {/* Шаги */}
          <div className="field">
            <div className="steps-header">
              <span className="label-title">Шаги приготовления</span>
              <button type="button" className="add-step-btn" onClick={addStep}>
                + Добавить шаг
              </button>
            </div>

            <div className="steps-list">
              {steps.map((s, idx) => (
                <div key={s.id} className="step-card">
                  <div className="step-top">
                    <strong>Шаг {idx + 1}</strong>
                    <button
                      type="button"
                      className="remove-step"
                      onClick={() => removeStep(s.id)}
                      aria-label={`Удалить шаг ${idx + 1}`}
                    >
                      Удалить
                    </button>
                  </div>

                  <textarea
                    placeholder="Опиши этот шаг..."
                    value={s.text}
                    onChange={(e) => handleStepChange(s.id, "text", e.target.value)}
                  />

                  <div className="step-image-row">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleStepImage(s.id, e.target.files?.[0] || null)}
                    />
                    {s.preview && (
                      <div className="image-preview small">
                        <img src={s.preview} alt={`step ${idx + 1}`} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="actions-row">
            <button type="submit" className="publish-btn">Опубликовать</button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                // откат формы
                if (window.confirm("Отменить и вернуться назад?")) {
                  navigate(-1);
                }
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Upload;
