import React, { useState } from 'react';
import api from './api';
import './Modal.css';

function CustomerModal({ show, onClose, onAdd }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      </div>
    )
  );
}

export default CustomerModal;
