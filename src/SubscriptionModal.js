import React, { useState, useEffect } from 'react';
import api from './api';
import './global.css';

function SubscriptionModal({ show, onClose, onAdd, subscription }) {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(subscription ? subscription.provider_id : null);
  const [cost, setCost] = useState(subscription ? subscription.cost : '');
  const [startDate, setStartDate] = useState(subscription ? subscription.start_date : '');
  const [durationDays, setDurationDays] = useState(subscription ? subscription.duration_days : 30);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/subscription-providers');
      setProviders(response.data);
      if (response.data.length > 0 && !subscription) {
        setSelectedProvider(response.data[0].id);
        setCost(response.data[0].default_cost);
      }
    } catch (error) {
      console.error('Error fetching providers:', error.response?.data || error.message);
      setError('Failed to load providers. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const handleProviderChange = (providerId) => {
    const provider = providers.find(p => p.id === parseInt(providerId));
    if (provider) {
      setSelectedProvider(provider.id);
      setCost(provider.default_cost);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    try {
      if (subscription) {
        await api.put(`/subscriptions/${subscription.id}`, {
          providerId: selectedProvider,
          cost,
          startDate,
          durationDays,
          currency
        });
      } else {
        await api.post('/subscriptions', {
          providerId: selectedProvider,
          cost,
          startDate,
          durationDays,
          currency
        });
      }
      onAdd();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while saving the subscription');
    }
  };

  return (
    show && (
      <div className="modal">
        <div className="modal-content">
          <button className="close" onClick={onClose}>&times;</button>
          <form onSubmit={handleSubmit}>
            <select onChange={(e) => handleProviderChange(e.target.value)} value={selectedProvider || ''}>
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
              placeholder="Start Date"
              required
            />
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="Duration (days)"
              required
            />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
              <option value="USD">USD</option>
              <option value="TZS">TZS</option>
            </select>
            <button type="submit">{subscription ? 'Update Subscription' : 'Add Subscription'}</button>
            {error && <div className="error-message">{error}</div>}
          </form>
          {showConfirmation && (
            <div className="confirmation-dialog">
              <p>Are you sure you want to save this subscription?</p>
              <button onClick={confirmSubmit}>Yes, Confirm</button>
              <button onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default SubscriptionModal;
