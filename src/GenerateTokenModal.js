import React, { useState, useEffect } from 'react';
import api from './api';
import './global.css';

function GenerateTokenModal({ show, onClose, onTokenGenerated }) {
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [hoursPurchased, setHoursPurchased] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (show) {
      fetchCustomers();
      fetchSubscriptions();
    }
  }, [show]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
      if (response.data.length > 0) {
        setSelectedCustomer(response.data[0]);
      }
    } catch (error) {
      setError('Failed to load customers. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      const activeSubscriptions = response.data.filter(sub => sub.is_active);
      setSubscriptions(activeSubscriptions);
      if (activeSubscriptions.length > 0) {
        setSelectedSubscription(activeSubscriptions[0]);
        calculateHourlyRate(activeSubscriptions[0]);
        fetchDiscountRate(activeSubscriptions[0].id);
      }
    } catch (error) {
      setError('Failed to load subscriptions. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const calculateHourlyRate = (subscription) => {
    const costInTZS = subscription.cost * 2800;
    const endDate = new Date(subscription.start_date);
    endDate.setDate(endDate.getDate() + subscription.duration_days);
    const remainingHours = Math.max((endDate - new Date()) / (1000 * 60 * 60), 0);
    const rate = costInTZS / remainingHours;
    setHourlyRate(rate);
  };

  const fetchDiscountRate = async (subscriptionId) => {
    try {
      const response = await api.get(`/subscription-customer-counts/${subscriptionId}`);
      const customerCount = response.data.customerCount;
      // Example discount calculation: 1% discount for every 5 customers, up to 20%
      const calculatedDiscount = Math.min(Math.floor(customerCount / 5) * 0.01, 0.2);
      setDiscount(calculatedDiscount);
    } catch (error) {
      console.error('Error fetching discount rate:', error);
    }
  };

  const handleSubscriptionChange = (e) => {
    const subscription = subscriptions.find(s => s.id === parseInt(e.target.value));
    setSelectedSubscription(subscription);
    calculateHourlyRate(subscription);
    fetchDiscountRate(subscription.id);
    updateAmountPaid(hoursPurchased, subscription);
  };

  const handleHoursPurchasedChange = (e) => {
    const hours = e.target.value;
    setHoursPurchased(hours);
    updateAmountPaid(hours, selectedSubscription);
  };

  const updateAmountPaid = (hours, subscription) => {
    if (hours && subscription) {
      const amount = hours * hourlyRate * (1 - discount);
      setAmountPaid(amount.toFixed(2));
      
      const endDate = new Date(subscription.start_date);
      endDate.setDate(endDate.getDate() + subscription.duration_days);
      const remainingHours = Math.max((endDate - new Date()) / (1000 * 60 * 60), 0);
      if (parseFloat(hours) > remainingHours) {
        setWarning(`Warning: The requested hours (${hours}) exceed the remaining subscription time (${remainingHours.toFixed(2)} hours).`);
      } else {
        setWarning('');
      }
    }
  };

  const handleSubmit = async () => {
    setError('');
    setWarning('');

    if (parseFloat(amountPaid) < 1000) {
      setError('Minimum purchase amount is 1000 TZS.');
      return;
    }

    if (warning) {
      setError('Cannot purchase more hours than remaining in the subscription.');
      return;
    }

    try {
      const response = await api.post('/purchaseTokens', {
        userId: selectedCustomer.id,
        serviceId: selectedSubscription.id,
        amountPaid: parseFloat(amountPaid),
        hoursPurchased: parseFloat(hoursPurchased)
      });
      onTokenGenerated(response.data.token);
    } catch (error) {
      setError('Failed to generate token. ' + (error.response?.data?.details || 'Please try again.'));
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Generate New Token</h2>
        {error && <div className="error-message">{error}</div>}
        {warning && <div className="warning-message">{warning}</div>}
        <div className="form-group">
          <label htmlFor="customer">Customer:</label>
          <select
            id="customer"
            value={selectedCustomer?.id || ''}
            onChange={(e) => setSelectedCustomer(customers.find(c => c.id === parseInt(e.target.value)))}
          >
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.full_name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="subscription">Subscription Service:</label>
          <select
            id="subscription"
            value={selectedSubscription?.id || ''}
            onChange={handleSubscriptionChange}
          >
            {subscriptions.map(subscription => (
              <option key={subscription.id} value={subscription.id}>{subscription.service_name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="hoursPurchased">Hours Purchased:</label>
          <input
            id="hoursPurchased"
            type="number"
            value={hoursPurchased}
            onChange={handleHoursPurchasedChange}
            placeholder="Hours Purchased"
          />
        </div>
        <div className="form-group">
          <label htmlFor="amountPaid">Amount Paid (TZS):</label>
          <input
            id="amountPaid"
            type="number"
            value={amountPaid}
            readOnly
            placeholder="Amount Paid (TZS)"
          />
        </div>
        <div className="form-group">
          <label>Hourly Rate: {hourlyRate.toFixed(2)} TZS</label>
        </div>
        <div className="form-group">
          <label>Discount: {(discount * 100).toFixed(2)}%</label>
        </div>
        <div className="button-group">
          <button onClick={handleSubmit}>Generate Token</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default GenerateTokenModal;
