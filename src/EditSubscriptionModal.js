import React, { useState, useEffect } from 'react';
import api from './api';

function EditSubscriptionModal({ isOpen, onClose, subscription, onUpdate }) {
  const [cost, setCost] = useState(subscription.cost);
  const [durationDays, setDurationDays] = useState(subscription.duration_days);
  const [startDate, setStartDate] = useState(subscription.start_date);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subscription) {
      setCost(subscription.cost);
      setDurationDays(subscription.duration_days);
      setStartDate(subscription.start_date);
    }
  }, [subscription]);

  const handleUpdate = () => {
    setError('');
    const updatedSubscription = {
      ...subscription,
      cost,
      duration_days: durationDays,
      start_date: startDate
    };

    api.put(`/subscriptions/${subscription.id}`, updatedSubscription)
      .then(response => {
        onUpdate(response.data);
        onClose();
      })
      .catch(error => {
        setError('An error occurred while updating the subscription.');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Subscription</h2>
        {error && <div className="error-message">{error}</div>}
        <label>Cost (USD):</label>
        <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} required />
        <label>Duration (Days):</label>
        <input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <button onClick={handleUpdate}>Update Subscription</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default EditSubscriptionModal;