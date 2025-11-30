import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <nav className="navbar">
          <h1>Мой сайт</h1>
          <ul className="nav-links">
            <li><a href="#home">Главная</a></li>
            <li><a href="#about">О нас</a></li>
            <li><a href="#contact">Контакты</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <h2>Добро пожаловать!</h2>
          <p>Это мой первый сайт на React</p>
          <button onClick={() => alert('Привет!')}>Нажми меня</button>
        </section>

        <section id="about" className="about">
          <h2>О нас</h2>
          <p>Мы создаем крутые веб-приложения</p>
        </section>

        <section id="contact" className="contact">
          <h2>Контакты</h2>
          <p>Email: example@mail.com</p>
        </section>
      </main>

      <footer>
        <p>&copy; 2024 Мой сайт</p>
      </footer>
    </div>
  );
}

export default App;