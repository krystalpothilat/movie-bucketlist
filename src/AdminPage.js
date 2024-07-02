import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import "./styles/AdminPage.css";
const AdminPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'password') {
        login(); // Assuming login function sets authentication status in AuthContext
        navigate('/'); // Redirect to homepage after successful login
      } else {
        setLoginStatus('Invalid login'); // Display error message for invalid login
      }
  };

  return (
    <div>
    <h1>Admin Login</h1>
    <div className = "login">
        <label>
          Username: <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      <button onClick={handleLogin}>Login</button>
      {loginStatus && <p className="login-status">{loginStatus}</p>}    
    </div>
    </div>

  );
};

export default AdminPage;
