import React, { useState, useEffect } from 'react';
import api from './api';
import './Modal.css';

function SubscriptionModal({ show, onClose, onAdd }) {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [cost, setCost] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (show) {
      fetchProviders();
    }
  }, [show]);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/subscription-providers');
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError('Failed to fetch providers');
    }
  };

  const handleProviderChange = (e) => {
    const provider = providers.find(p => p.id === parseInt(e.target.value));
    setSelectedProvider(provider.id);
    setCost(provider.default_cost);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/subscriptions', {
        provider_id: selectedProvider,
        cost,
        start_date: startDate,
        duration_days: duration,
        currency
      });
      onAdd(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding subscription:', error);
      setError('Failed to add subscription: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Subscription</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <select value={selectedProvider} onChange={handleProviderChange} required>
            <option value="">Select a provider</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Cost"
            required
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (days)"
            required
          />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
            <option value="USD">USD</option>
            <option value="TZS">TZS</option>
          </select>
          <button type="submit">Add Subscription</button>
          <button type="button" onClick={onClose}>Close</button>
        </form>
      </div>
    </div>
  );
}

export default SubscriptionModal;
