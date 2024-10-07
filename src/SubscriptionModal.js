import React, { useState, useEffect } from 'react';
import api from './api';
import ConfirmationDialog from './ConfirmationDialog'; // Import the ConfirmationDialog
import './Modal.css';

function SubscriptionModal({ show, onClose, onAdd }) {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [cost, setCost] = useState('');
  const [duration, setDuration] = useState(30); // Default duration to 30 days
  const [startDate, setStartDate] = useState(''); // New state for start date
  const [error, setError] = useState('');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  useEffect(() => {
    if (show) {
      api.get('/subscription-providers')
        .then(response => {
          setProviders(response.data);
        })
        .catch(error => {
          console.error('Failed to fetch subscription providers:', error);
          setError('Failed to fetch subscription providers. Please try again.');
        });
    }
  }, [show]);

  const handleProviderChange = (e) => {
    const providerName = e.target.value;
    setSelectedProvider(providerName);
    const selected = providers.find(provider => provider.name === providerName);
    if (selected) {
      setCost(selected.default_cost); // Automatically fill the cost
    } else {
      setCost('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setShowConfirmationDialog(true); // Show confirmation dialog
  };

  const handleConfirm = async () => {
    const subscriptionData = {
      service_name: selectedProvider,
      cost_usd: parseFloat(cost), // Ensure cost is a number
      duration_days: duration,
      start_date: startDate // Include start date in the data sent to the backend
    };

    console.log('Sending subscription data:', subscriptionData); // Debugging log

    try {
      const response = await api.post('/subscriptions', subscriptionData);
      onAdd(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding subscription:', error);
      setError(error.response?.data?.error || 'Failed to add subscription. Please try again.');
    } finally {
      setShowConfirmationDialog(false); // Close confirmation dialog
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Subscription</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Service Name:</label>
          <select value={selectedProvider} onChange={handleProviderChange} required>
            <option value="">Select a provider</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.name}>{provider.name}</option>
            ))}
          </select>
          <label>Cost (USD):</label>
          <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} required />
          <label>Duration (Days):</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required />
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /> {/* New input for start date */}
          <button type="submit">Add Subscription</button>
          <button type="button" onClick={onClose}>Close</button>
        </form>
      </div>

      <ConfirmationDialog
        show={showConfirmationDialog}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmationDialog(false)}
        message={`Are you sure you want to add the subscription for "${selectedProvider}"?`}
      />
    </div>
  );
}

export default SubscriptionModal;