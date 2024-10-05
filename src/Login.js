import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './Login.css';
import ChangePasswordModal from './ChangePasswordModal';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/login', { username, password });
      if (response.data.requirePasswordChange) {
        setShowChangePasswordModal(true);
      } else {
        handleSuccessfulLogin(response.data.token);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.error || 'An error occurred during login. Please try again.');
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/changePassword', { 
        username, 
        currentPassword, 
        newPassword 
      });
      setShowChangePasswordModal(false);
      setPasswordChanged(true);
      setPassword(''); // Clear the password field
      setError('Password changed successfully. Please log in with your new password.');
    } catch (error) {
      console.error('Password change failed:', error);
      setError(error.response?.data?.error || 'Failed to change password. Please try again.');
    }
  };

  const handleSuccessfulLogin = (token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username); // Add this line
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUser(decodedToken);
    navigate('/');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        {passwordChanged && <p className="success-message">Password changed successfully. Please log in with your new password.</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {showChangePasswordModal && (
        <ChangePasswordModal
          onSubmit={handlePasswordChange}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
}

export default Login;