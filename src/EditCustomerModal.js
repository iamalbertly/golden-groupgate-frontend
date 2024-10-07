import React, { useState, useEffect } from 'react';
import api from './api';

function EditCustomerModal({ isOpen, onClose, customer, onUpdate }) {
  const [fullName, setFullName] = useState(customer.full_name);
  const [email, setEmail] = useState(customer.email);
  const [phoneNumber, setPhoneNumber] = useState(customer.phone_number);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFullName(customer.full_name);
      setEmail(customer.email);
      setPhoneNumber(customer.phone_number);
    }
  }, [customer]);

  const handleUpdate = () => {
    setError(''); // Clear previous errors
    const updatedCustomer = {
      id: customer.id,
      full_name: fullName,
      email: email,
      phone_number: phoneNumber,
    };

    api.put(`/customers/${customer.id}`, updatedCustomer)
      .then(response => {
        onUpdate(response.data); // Call the onUpdate function passed as prop
        onClose(); // Close the modal
      })
      .catch(error => {
        console.error('Error updating customer:', error);
        setError(error.response?.data?.error || 'An error occurred while updating the customer.');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Customer</h2>
        {error && <div className="error-message">{error}</div>}
        <label>Full Name:</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Phone Number:</label>
        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        <button onClick={handleUpdate}>Update Customer</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default EditCustomerModal;