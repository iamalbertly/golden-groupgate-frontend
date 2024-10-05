import React, { useState } from 'react';
import api from './api';
import './Modal.css';

function ChangePasswordModal({ onSubmit, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.post('/changePassword', {
        username: localStorage.getItem('username'), // Make sure to store the username in localStorage when logging in
        currentPassword,
        newPassword
      });

      if (response.data.message) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred while changing the password. Please try again.');
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Change Password</h2>
        <p>You must change your password before continuing.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;