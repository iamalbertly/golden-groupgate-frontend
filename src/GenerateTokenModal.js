import React, { useState, useEffect } from 'react';
import api from './api';
import './Modal.css';

function GenerateTokenModal({ show, onClose, subscription }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [hoursPurchased, setHoursPurchased] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error.response?.data || error.message);
      setError('Failed to load customers. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/generate-token', {
        userId: selectedCustomer,
        serviceId: subscription.id,
        expirationMinutes: hoursPurchased * 60 // Assuming 1 hour = 60 minutes
      });
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while generating the token');
    }
  };

  return (
    show && (
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <select onChange={(e) => setSelectedCustomer(e.target.value)} value={selectedCustomer || ''}>
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.full_name}</option>
            ))}
          </select>
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="Amount Paid"
            required
          />
          <input
            type="number"
            value={hoursPurchased}
            onChange={(e) => setHoursPurchased(e.target.value)}
            placeholder="Hours Purchased"
            required
          />
          <button type="submit">Generate Token</button>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    )
  );
}

export default GenerateTokenModal;
