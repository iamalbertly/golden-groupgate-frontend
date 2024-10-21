import React, { useState } from 'react';
import api from './api';
import './global.css';

function CustomerModal({ show, onClose, onAdd }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    try {
      const response = await api.post('/customers', {
        full_name: fullName,
        email,
        phone_number: phoneNumber
      });
      onAdd(response.data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while adding the customer');
    }
  };

  return (
    show && (
      <div className="modal">
        <div className="modal-content">
          <button className="close" onClick={onClose}>&times;</button>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              required
            />
            <button type="submit">Add Customer</button>
            {error && <div className="error-message">{error}</div>}
          </form>
          {showConfirmation && (
            <div className="confirmation-dialog">
              <p>Are you sure you want to add this customer?</p>
              <button onClick={confirmSubmit}>Yes, Confirm</button>
              <button onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default CustomerModal;
