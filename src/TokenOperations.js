import React, { useState, useEffect } from 'react';
import api from './api';
import './TokenOperations.css';

function TokenOperations() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [hoursPurchased, setHoursPurchased] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [remainingHours, setRemainingHours] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState([]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      const activeSubscriptions = response.data.filter(sub => sub.is_active === 1);
      setSubscriptions(activeSubscriptions);
      if (activeSubscriptions.length > 0) {
        handleSubscriptionChange(activeSubscriptions[0].id);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error.response?.data || error.message);
      setError('Failed to load subscriptions. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const handleSubscriptionChange = (subscriptionId) => {
    const subscription = subscriptions.find(sub => sub.id === parseInt(subscriptionId));
    if (subscription) {
      const costInTZS = subscription.cost * 2800;
      const hoursLeft = subscription.duration_days * 24; // Assuming full days
      const rate = costInTZS / hoursLeft;
      setSelectedSubscription(subscription);
      setHourlyRate(rate);
      setRemainingHours(hoursLeft);
      calculateDiscount(subscription.id);
    }
  };

  const calculateDiscount = async (subscriptionId) => {
    try {
      const response = await api.get(`/subscription-customer-counts`);
      const customerCount = response.data.find(item => item.service_name === selectedSubscription.service_name)?.customer_count || 0;
      const discountRate = customerCount > 5 ? 0.1 : 0; // Example: 10% discount for more than 5 customers
      setDiscount(discountRate);
    } catch (error) {
      console.error('Error fetching customer counts:', error.response?.data || error.message);
    }
  };

  const handleAmountChange = (value) => {
    setAmountPaid(value);
    const calculatedHours = (value * (1 - discount)) / hourlyRate;
    setHoursPurchased(calculatedHours.toFixed(2));
  };

  const handleHoursChange = (value) => {
    setHoursPurchased(value);
    const calculatedAmount = value * hourlyRate / (1 - discount);
    setAmountPaid(calculatedAmount.toFixed(2));
  };

  const handleSubmit = () => {
    if (amountPaid < 1000) {
      setError('Minimum purchase amount is 1000 TZS.');
      return;
    }
    if (hoursPurchased > remainingHours) {
      setError('Cannot purchase more hours than remaining.');
      return;
    }
    setConfirmation(true);
  };

  const confirmPurchase = () => {
    const details = {
      subscription: selectedSubscription.service_name,
      amountPaid,
      hoursPurchased,
      discount: discount * 100 + '%'
    };
    setPurchaseDetails([...purchaseDetails, details]);
    setConfirmation(false);
    // Reset fields
    setAmountPaid('');
    setHoursPurchased('');
    setError('');
  };

  return (
    <div className="token-operations">
      <h1>Token Generation</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label>Select Subscription Service:</label>
        <select onChange={(e) => handleSubscriptionChange(e.target.value)} value={selectedSubscription?.id || ''}>
          <option value="">Select a service</option>
          {subscriptions.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.service_name}</option>
          ))}
        </select>
      </div>
      {selectedSubscription && (
        <>
          <div className="form-group">
            <label>Hourly Rate: {hourlyRate.toFixed(2)} TZS</label>
          </div>
          <div className="form-group">
            <label>Remaining Hours: {remainingHours}</label>
          </div>
          <div className="form-group">
            <label>Amount Paid (TZS):</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Hours Purchased:</label>
            <input
              type="number"
              value={hoursPurchased}
              onChange={(e) => handleHoursChange(e.target.value)}
            />
          </div>
          <button onClick={handleSubmit}>Generate Token</button>
        </>
      )}
      {confirmation && (
        <div className="confirmation">
          <h2>Confirm Purchase</h2>
          <p>Service: {selectedSubscription.service_name}</p>
          <p>Amount Paid: {amountPaid} TZS</p>
          <p>Hours Purchased: {hoursPurchased}</p>
          <p>Discount: {discount * 100}%</p>
          <button onClick={confirmPurchase}>Confirm</button>
          <button onClick={() => setConfirmation(false)}>Cancel</button>
        </div>
      )}
      <div className="purchase-details">
        <h2>Purchase Details</h2>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Amount Paid</th>
              <th>Hours Purchased</th>
              <th>Discount</th>
            </tr>
          </thead>
          <tbody>
            {purchaseDetails.map((detail, index) => (
              <tr key={index}>
                <td>{detail.subscription}</td>
                <td>{detail.amountPaid}</td>
                <td>{detail.hoursPurchased}</td>
                <td>{detail.discount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TokenOperations;
