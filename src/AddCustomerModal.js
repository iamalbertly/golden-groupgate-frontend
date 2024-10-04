import React, { useState } from 'react';
import axios from 'axios';

function AddCustomerModal({ isOpen, onClose, onCustomerAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');

  const handleAddCustomer = () => {
    axios.post('http://localhost:5000/addCustomer', { name, email, phone_number })
      .then(response => {
        onCustomerAdded();
        onClose();
      })
      .catch(error => {
        console.error('Error adding customer:', error);
        alert(`Error adding customer: ${error.message}`);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Customer</h2>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Phone Number:</label>
        <input type="text" value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} />
        <button onClick={handleAddCustomer}>Add Customer</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default AddCustomerModal;