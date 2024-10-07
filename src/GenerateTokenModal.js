import React, { useState, useEffect } from 'react';
import api from './api';

function GenerateTokenModal({ isOpen, onClose, onTokenGenerated, customerId, availableServices = [], customerDetails }) {
  const [amountPaid, setAmountPaid] = useState('');
  const [hoursPurchased, setHoursPurchased] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (availableServices && availableServices.length > 0) {
      setSelectedService(availableServices[0]);
    }
  }, [availableServices]);

  useEffect(() => {
    if (selectedService) {
      api.get(`/service-rate/${selectedService}`)
        .then(response => {
          const rate = response.data.rate;
          setHourlyRate(rate);
        })
        .catch(error => {
          console.error('Error fetching service rate:', error);
          setError(`Error fetching service rate: ${error.response?.data?.error || error.message}`);
        });
    }
  }, [selectedService]);

  useEffect(() => {
    if (amountPaid && hourlyRate) {
      const hours = Math.floor(amountPaid / hourlyRate);
      setHoursPurchased(hours);
    }
  }, [amountPaid, hourlyRate]);

  const handleGenerateToken = () => {
    if (!amountPaid || !hoursPurchased || !selectedService) {
      setError('Please fill in all fields before generating a token.');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmPurchase = () => {
    api.post('/generateToken', { 
      customerId, 
      amountPaid: parseFloat(amountPaid), 
      hoursPurchased: parseInt(hoursPurchased, 10),
      service: selectedService
    })
      .then(response => {
        setGeneratedToken(response.data.token);
        onTokenGenerated(response.data);
      })
      .catch(error => {
        console.error('Error generating token:', error);
        setError(`Error generating token: ${error.response?.data?.error || error.message}`);
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
        <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} min="1000" step="100" />
        <p>Hours to be Purchased: {hoursPurchased}</p>
        <p>Hourly Rate: {hourlyRate.toFixed(2)} TZS</p>
        <button onClick={handleGenerateToken} disabled={!selectedService || amountPaid < 1000}>Generate Token</button>
        <button onClick={onClose}>Close</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {showConfirmation && (
        <div className="confirmation-dialog">
          <h3>Confirm Purchase</h3>
          <p>Service: {selectedService}</p>
          <p>Amount Paid: {amountPaid} TZS</p>
          <p>Hours to be Purchased: {hoursPurchased}</p>
          <button onClick={confirmPurchase}>Confirm</button>
          <button onClick={() => setShowConfirmation(false)}>Cancel</button>
        </div>
      )}

      {generatedToken && (
        <div className="generated-token">
          <h3>Generated Token:</h3>
          <p>{generatedToken}</p>
          <button onClick={() => {
            onClose();
            setGeneratedToken('');
            setShowConfirmation(false);
          }}>Close</button>
        </div>
      )}
    </div>
  );
}

export default GenerateTokenModal;