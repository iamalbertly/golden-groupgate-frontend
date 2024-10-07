import React, { useState } from 'react';
import api from './api';
import ConfirmationDialog from './ConfirmationDialog'; // Import the ConfirmationDialog
import './Modal.css';

function CustomerModal({ show, onClose, onAdd }) {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setShowConfirmationDialog(true); // Show confirmation dialog
  };

  const handleConfirm = async () => {
    try {
      const response = await api.post('/customers', { full_name, email, phone_number });
      onAdd(response.data);
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred while adding the customer. Please try again.');
      }
    } finally {
      setShowConfirmationDialog(false); // Close confirmation dialog
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Customer</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={full_name}
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
            type="tel"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
            required
          />
          <button type="submit">Add Customer</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>

      <ConfirmationDialog
        show={showConfirmationDialog}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmationDialog(false)}
        message={`Are you sure you want to add the customer "${full_name}"?`}
      />
    </div>
  );
}

export default CustomerModal;