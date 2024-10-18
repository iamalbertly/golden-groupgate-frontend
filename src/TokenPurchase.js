import React, { useState, useEffect } from 'react';
import api from './api';

function TokenPurchase() {
  const [service, setService] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [services, setServices] = useState([]); // New state for services

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/activeServices'); // Fetch active services
        setServices(response.data.services); // Assume response contains a 'services' array
      } catch (error) {
        setError('Failed to load services. Please try again.');
      }
    };

    fetchServices();
  }, []); // Empty dependency array to run once on mount

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
    <div className="token-purchase">
      <h2>Purchase Tokens</h2>
      <select value={service} onChange={(e) => setService(e.target.value)}>
        <option value="">Select Service</option>
        {services.map((service) => (
          <option key={service.id} value={service.name}>
            {service.name}
          </option>
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

export default TokenPurchase;
