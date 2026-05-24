import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './styles/AdminPage.css';

const AdminPage = () => {
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginStatus('Please enter username and password');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}/api/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (data.success) {
        login(); // sets isAuthenticated = true
        navigate(from, {
          state: {
            restoreWheel: location.state?.restoreWheel,
          },
        });
      } else {
        setLoginStatus('Invalid login');
      }
    } catch (err) {
      console.error(err);
      setLoginStatus('Server error. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">Admin Login</h1>

        <div className="admin-form">
          <label className="admin-label">
            Username
            <input
              className="admin-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="admin-label">
            Password:{' '}
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                className="admin-input"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <button onClick={handleLogin} id="login-button">
            Login
          </button>

          {loginStatus && <p className="login-status">{loginStatus}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
