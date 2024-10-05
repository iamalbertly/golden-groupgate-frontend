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

  useEffect(() => {
    if (show) {
      fetchProviders();
    }
  }, [show]);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/subscription-providers');
      if (response.data.length === 0) {
        // If no providers, add default providers
        await addDefaultProviders();
        fetchProviders(); // Fetch again after adding default providers
      } else {
        setProviders(response.data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError('Failed to fetch subscription providers. Please try again.');
    }
  };

  const addDefaultProviders = async () => {
    const defaultProviders = [
      { name: 'OpenAI', defaultCost: 20 },
      { name: 'Claude AI', defaultCost: 15 }
    ];

    for (const provider of defaultProviders) {
      try {
        await api.post('/subscription-providers', provider);
      } catch (error) {
        console.error(`Error adding default provider ${provider.name}:`, error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/subscriptions', { provider: selectedProvider, cost, startDate, duration });
      onAdd(response.data);
    } catch (error) {
      console.error('Error adding subscription:', error);
      setError('Failed to add subscription. Please try again.');
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Subscription</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <select 
            value={selectedProvider} 
            onChange={(e) => {
              setSelectedProvider(e.target.value);
              const selectedProviderData = providers.find(p => p.name === e.target.value);
              setCost(selectedProviderData && selectedProviderData.default_cost ? selectedProviderData.default_cost.toString() : '');
            }}
            required
          >
            <option value="">Select Provider</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.name}>{provider.name}</option>
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
          <button type="submit">Add Subscription</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default SubscriptionModal;