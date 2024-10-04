import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GenerateTokenModal({ isOpen, onClose, onTokenGenerated, customerId, availableServices = [], customerDetails }) {
  const [amountPaid, setAmountPaid] = useState('');
  const [hoursPurchased, setHoursPurchased] = useState(0);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    if (availableServices && availableServices.length > 0) {
      setSelectedService(availableServices[0]);
    }
  }, [availableServices]);

  const handleGenerateToken = () => {
    axios.post('http://localhost:5000/generateToken', { 
      customerId, 
      amountPaid, 
      hoursPurchased,
      service: selectedService
    })
      .then(response => {
        onTokenGenerated();
        onClose();
      })
      .catch(error => {
        console.error('Error generating token:', error);
        alert(`Error generating token: ${error.message}`);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Generate Token</h2>
        {customerDetails && (
          <div>
            <p><strong>Customer Name:</strong> {customerDetails.name}</p>
            <p><strong>Email:</strong> {customerDetails.email}</p>
            <p><strong>Phone:</strong> {customerDetails.phone_number}</p>
          </div>
        )}
        <label>Service:</label>
        <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
          {availableServices && availableServices.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
        <label>Amount Paid (TZS):</label>
        <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
        <label>Hours Purchased:</label>
        <input type="number" value={hoursPurchased} onChange={(e) => setHoursPurchased(e.target.value)} />
        <button onClick={handleGenerateToken} disabled={!selectedService}>Generate Token</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default GenerateTokenModal;