import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedOption, setSelectedOption] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    window.location.href = 'https://op255.github.io/mfg-maps/';
  };

  const specialFunction1 = () => {
    alert('⚡ Функция 1: Системные настройки активированы!');
    console.log('Функция системных настроек выполнена');
  };

  const specialFunction2 = () => {
    alert('🔧 Функция 2: Административная панель открыта!');
    console.log('Функция административной панели выполнена');
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
  };

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
                ⚡ Функция 1
              </button>
              <button className="action-btn function-btn-2" onClick={specialFunction2}>
                🔧 Функция 2
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