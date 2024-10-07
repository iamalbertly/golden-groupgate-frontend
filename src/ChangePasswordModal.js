import React, { useState } from 'react';
import api from './api';
import './Modal.css';

function ChangePasswordModal({ onSubmit, onClose, username }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!username) {
      setError('Username is missing. Please try logging in again.');
      return;
    }

    try {
      // Step 1: Verify current password and get change password token
      const verifyResponse = await api.post('/verifyPassword', {
        username,
        currentPassword
      });

      if (verifyResponse.data.changePasswordToken) {
        // Step 2: Change password using the change password token
        const changeResponse = await api.post('/changePassword', {
          changePasswordToken: verifyResponse.data.changePasswordToken,
          newPassword
        });

        if (changeResponse.data.message) {
          onSubmit(changeResponse.data.message);
        } else {
          setError('Failed to change password. Please try again.');
        }
      } else {
        setError('Failed to verify current password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(`Error: ${error.response.data.error}. Details: ${error.response.data.details || 'No additional details provided.'}`);
      } else {
        setError('An error occurred while changing the password. Please try again.');
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Change Password for {username}</h2>
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