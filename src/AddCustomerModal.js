import React, { useState, useEffect } from 'react';
import api from './api';

function AddCustomerModal({ isOpen, onClose, onCustomerAdded }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchExistingCustomers();
    }
  }, [isOpen]);

  const fetchExistingCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setExistingCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let customerData;
      if (isNewCustomer) {
        const response = await api.post('/customers', { 
          full_name: fullName, 
          email, 
          phone_number: phoneNumber
        });
        customerData = response.data;
      } else {
        customerData = existingCustomers.find(c => c.id === parseInt(selectedCustomer));
      }
      onCustomerAdded(customerData);
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while processing the customer.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Customer</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              <input
                type="radio"
                checked={isNewCustomer}
                onChange={() => setIsNewCustomer(true)}
              />
              New Customer
            </label>
            <label>
              <input
                type="radio"
                checked={!isNewCustomer}
                onChange={() => setIsNewCustomer(false)}
              />
              Existing Customer
            </label>
          </div>
          {isNewCustomer ? (
            <>
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
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                required
              />
            </>
          ) : (
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="">Select a customer</option>
              {existingCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.full_name}</option>
              ))}
            </select>
          )}
          <button type="submit">Add Customer</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default AddCustomerModal;