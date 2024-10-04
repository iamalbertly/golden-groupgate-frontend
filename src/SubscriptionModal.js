import React, { useState } from 'react';
import axios from 'axios';

const AI_SERVICES = ['OpenAI', 'Claude', 'GPT-J', 'BLOOM'];

function SubscriptionModal({ isOpen, onClose, onSubscriptionAdded }) {
  const [serviceName, setServiceName] = useState(AI_SERVICES[0]);
  const [costUSD, setCostUSD] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState(30);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/addSubscription', {
        service_name: serviceName,
        cost_usd: parseFloat(costUSD),
        start_date: startDate,
        duration_days: durationDays,
        added_by: localStorage.getItem('userId') // Assuming you store the user ID in localStorage
      });
      onSubscriptionAdded();
      onClose();
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('Failed to add subscription. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Subscription Service</h2>
        <form onSubmit={handleSubmit}>
          <select value={serviceName} onChange={(e) => setServiceName(e.target.value)}>
            {AI_SERVICES.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={costUSD} 
            onChange={(e) => setCostUSD(e.target.value)} 
            placeholder="Cost in USD" 
            required 
          />
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            required 
          />
          <input 
            type="range" 
            min="1" 
            max="365" 
            value={durationDays} 
            onChange={(e) => setDurationDays(e.target.value)} 
          />
          <span>{durationDays} days</span>
          <button type="submit">Add Subscription</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default SubscriptionModal;