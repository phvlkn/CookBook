import React, { useState, useEffect, useRef } from "react";
import "./Homepage.css";
import Header from "../Header/header.jsx";

// функция для генерации случайных изображений
const generatePins = (count = 10, start = 1) => {
  return Array.from({ length: count }, (_, i) => ({
    id: start + i,
    image: `https://picsum.photos/300/${300 + Math.floor(Math.random() * 200)}?random=${start + i}`,
    title: `Pin ${start + i}`,
  }));
};

function Homepage() {
  const [pins, setPins] = useState(generatePins(10));
  const [page, setPage] = useState(1);
  const loader = useRef(null); // наблюдатель за последним элементом

  // Подгрузка новых изображений при изменении page
  useEffect(() => {
    const newPins = generatePins(10, page * 10 + 1);
    setPins((prev) => [...prev, ...newPins]);
  }, [page]);

  // Intersection Observer: следим, когда пользователь долистал до конца
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loader.current) observer.observe(loader.current);

    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <h1>Pinterest Infinite Scroll</h1>
        <div className="grid">
          {pins.map((pin) => (
            <div key={pin.id} className="pin">
              <img src={pin.image} alt={pin.title} loading="lazy" />
              <p>{pin.title}</p>
            </div>
          ))}
        </div>

        {/* Элемент, за которым наблюдает IntersectionObserver */}
        <div ref={loader} className="loading">
          <p>Загрузка...</p>
        </div>
      </div>
    </>
  );
}

export default Homepage;
