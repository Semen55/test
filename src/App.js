import React, { useState } from 'react';
import './App.css';
import Page from './components/page';

function App() {
  const [selectedOption, setSelectedOption] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showMapPage, setShowMapPage] = useState(true); // Temporarily skip login

  const users = {
    'host': { password: 'host123', role: 'host' },
    'admin': { password: 'admin123', role: 'admin' }
  };

  const handleLogin = () => {
    const user = users[username];

    if (user && user.password === password) {
      setError('');
      setSelectedOption(user.role);

      if (user.role === 'host') {
        redirectToSite();
      } else {
        setShowActions(true);
      }
    } else {
      setError('Неверный логин или пароль!');
      setPassword('');
    }
  };

  const redirectToSite = () => {
    // Instead of redirecting to the deployed site
    // show the embedded map/game page from this project
    setShowMapPage(true);
  };

  const specialFunction1 = () => {
    alert('Задания');
    console.log('Задания');
  };

  const specialFunction2 = () => {
    alert('История');
    console.log('История');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setError('');
    setSelectedOption(0);
    setShowActions(false);
    setShowMapPage(false);
  };

  if (showMapPage) {
    // Show the exact map/game page that was previously at
    // https://op255.github.io/mfg-maps/ rendered locally
    return <Page />;
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Система авторизации</h1>

        {/* Форма логина */}
        {!showActions && selectedOption !== 'host' && (
          <div className="login-section">
            <h2>Введите логин и пароль</h2>

            <div className="input-group">
              <label>Логин:</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин..."
              />
            </div>

            <div className="input-group">
              <label>Пароль:</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите пароль..."
              />
            </div>

            <button className="login-btn" onClick={handleLogin}>
              🔐 Войти
            </button>

            <div className="user-hints">
              <p><strong>Доступные пользователи:</strong></p>
              <p>Логин: <code>host</code> | Пароль: <code>host123</code></p>
              <p>Логин: <code>admin</code> | Пароль: <code>admin123</code></p>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {/* Панель администратора */}
        {showActions && (
          <div className="admin-panel">
            <h2>👨‍💼 Панель администратора</h2>
            <p className="welcome-text">Добро пожаловать, {username}!</p>

            <div className="action-buttons">
              <button className="action-btn redirect-btn" onClick={redirectToSite}>
                🌐 Перейти на сайт
              </button>
              <button className="action-btn function-btn-1" onClick={specialFunction1}>
                Задания
              </button>
              <button className="action-btn function-btn-2" onClick={specialFunction2}>
                История
              </button>
            </div>

            <button className="logout-btn" onClick={resetForm}>
              🚪 Выйти
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;