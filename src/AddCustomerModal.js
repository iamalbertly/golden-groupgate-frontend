import React, { useState } from 'react';
import api from './api';

function AddCustomerModal({ isOpen, onClose, onCustomerAdded }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleAddCustomer = () => {
    setError(''); // Clear previous errors
    const customerData = {
      full_name: fullName,
      email: email,
      phone_number: phoneNumber
    };
    console.log('Sending customer data:', customerData); // Debugging log
    api.post('/customers', customerData)
      .then(response => {
        onCustomerAdded();
        onClose();
      })
      .catch(error => {
        console.error('Error adding customer:', error);
        setError(error.response?.data?.error || 'An error occurred while adding the customer.');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Customer</h2>
        {error && <div className="error-message">{error}</div>}
        <label>Full Name:</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Phone Number:</label>
        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        <button onClick={handleAddCustomer}>Add Customer</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default AddCustomerModal;