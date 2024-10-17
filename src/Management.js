import React, { useState, useEffect } from 'react';
import api from './api';

function Management() {
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [defaultCost, setDefaultCost] = useState('');
  const [service, setService] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchCustomers();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleAddService = async () => {
    try {
      await api.post('/services', { name, default_cost: defaultCost });
      fetchServices();
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handlePurchase = async () => {
    try {
      const response = await api.post('/purchaseTokens', { service, amountPaid });
      setToken(response.data.token);
      setError('');
    } catch (error) {
      setError('Failed to purchase tokens. Please try again.');
    }
  };

  return (
    <div className="management">
      <h2>Service Management</h2>
      <input
        type="text"
        placeholder="Service Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Default Cost"
        value={defaultCost}
        onChange={(e) => setDefaultCost(e.target.value)}
      />
      <button onClick={handleAddService}>Add Service</button>
      <ul>
        {services.map(service => (
          <li key={service.id}>{service.name} - {service.default_cost}</li>
        ))}
      </ul>

      <h2>Token Purchase</h2>
      <select value={service} onChange={(e) => setService(e.target.value)}>
        <option value="">Select Service</option>
        {services.map(service => (
          <option key={service.id} value={service.name}>{service.name}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Amount Paid"
        value={amountPaid}
        onChange={(e) => setAmountPaid(e.target.value)}
      />
      <button onClick={handlePurchase}>Purchase</button>
      {token && <div>Your token: {token}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default Management;