import React, { useState, useEffect } from 'react';
import api from './api';

function EditSubscriptionModal({ isOpen, onClose, subscription, onUpdate }) {
  const [costUsd, setCostUsd] = useState(subscription.cost_usd);
  const [durationDays, setDurationDays] = useState(subscription.duration_days);
  const [startDate, setStartDate] = useState(subscription.start_date); // New state for start date
  const [error, setError] = useState('');

  useEffect(() => {
    if (subscription) {
      setCostUsd(subscription.cost_usd);
      setDurationDays(subscription.duration_days);
      setStartDate(subscription.start_date); // Set start date from subscription
    }
  }, [subscription]);

  const handleUpdate = () => {
    setError(''); // Clear previous errors
    const updatedSubscription = {
      service_name: subscription.service_name, // Keep service name unchanged
      cost_usd: costUsd,
      duration_days: durationDays,
      start_date: startDate // Include start date in the update
    };

    api.put(`/subscriptions/${subscription.id}`, updatedSubscription)
      .then(response => {
        onUpdate(response.data); // Call the onUpdate function passed as prop
        onClose(); // Close the modal
      })
      .catch(error => {
        console.error('Error updating subscription:', error);
        setError(error.response?.data?.error || 'An error occurred while updating the subscription.');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Subscription</h2>
        {error && <div className="error-message">{error}</div>}
        <label>Service Name:</label>
        <input type="text" value={subscription.service_name} readOnly /> {/* Make this field read-only */}
        <label>Cost (USD):</label>
        <input type="number" value={costUsd} onChange={(e) => setCostUsd(e.target.value)} required />
        <label>Duration (Days):</label>
        <input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /> {/* New input for start date */}
        <button onClick={handleUpdate}>Update Subscription</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default EditSubscriptionModal;