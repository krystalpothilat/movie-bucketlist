import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordAuth = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_API}${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, name, password }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        navigate('/');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_API}/api/auth/google`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlePasswordAuth();
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">
          {isRegister ? 'Create account' : 'Sign in'}
        </h1>

        <div className="admin-form">
          <button onClick={handleGoogle} id="google-login-button">
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              style={{ width: '18px', height: '18px', marginRight: '8px' }}
            />
            Continue with Google
          </button>

          <div className="divider">or</div>

          {isRegister && (
            <label className="admin-label">
              Name
              <input
                className="admin-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label className="admin-label">
            Email
            <input
              className="admin-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="admin-label">
            Password
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </label>

          <button onClick={handlePasswordAuth} id="login-button">
            {isRegister ? 'Create account' : 'Sign in'}
          </button>

          {error && <p className="login-status">{error}</p>}

          <p
            className="toggle-auth"
            onClick={() => {
              setIsRegister((p) => !p);
              setError('');
            }}
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Register"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
