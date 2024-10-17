import React, { useState, useEffect } from 'react';
import api from './api';
import './Modal.css';

function GenerateTokenModal({ isOpen, onClose, onTokenGenerated }) {
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [hoursPurchased, setHoursPurchased] = useState('');
  const [remainingHours, setRemainingHours] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchSubscriptions();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
      if (response.data.length > 0) {
        setSelectedCustomer(response.data[0].id.toString());
      }
    } catch (error) {
      setError('Failed to fetch customers');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
      if (response.data.length > 0) {
        await handleSubscriptionChange(response.data[0].id.toString());
      }
    } catch (error) {
      setError('Failed to fetch subscriptions: ' + error.message);
    }
  };

  const handleSubscriptionChange = async (subscriptionId) => {
    setSelectedSubscription(subscriptionId);
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}`);
      const subscription = response.data;
      setRemainingHours(subscription.remainingHours);
      setHourlyRate(subscription.hourlyRate);
      setActiveCustomers(subscription.activeCustomers);
      setDiscount(subscription.discount);
      
      if (hoursPurchased) {
        const discountedRate = subscription.hourlyRate * (1 - subscription.discount);
        setAmountPaid((hoursPurchased * discountedRate).toFixed(2));
      }
    } catch (error) {
      setError('Failed to fetch subscription details: ' + error.message);
    }
  };

  const handleHoursPurchasedChange = (e) => {
    const hours = parseInt(e.target.value);
    setHoursPurchased(hours);
    if (hourlyRate) {
      const discountedRate = hourlyRate * (1 - discount);
      setAmountPaid((hours * discountedRate).toFixed(2));
    }
  };

  const handleAmountPaidChange = (e) => {
    const amount = parseFloat(e.target.value);
    setAmountPaid(amount);
    if (hourlyRate) {
      const discountedRate = hourlyRate * (1 - discount);
      setHoursPurchased(Math.floor(amount / discountedRate));
    }
  };

  const handleGenerateToken = () => {
    setError('');
    if (!selectedCustomer || !selectedSubscription || !amountPaid || !hoursPurchased) {
      setError('All fields are required');
      return;
    }
    if (amountPaid < 1000) {
      setError('Minimum amount is 1000 TZS');
      return;
    }
    if (hoursPurchased > remainingHours) {
      setError('Purchased hours exceed remaining hours');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmPurchase = async () => {
    try {
      const response = await api.post('/generateToken', {
        customerId: selectedCustomer,
        subscriptionId: selectedSubscription,
        amountPaid: parseFloat(amountPaid),
        hoursPurchased: parseInt(hoursPurchased),
        discount: discount
      });
      onTokenGenerated(response.data);
      onClose();
    } catch (error) {
      console.error('Error generating token:', error);
      setError(error.response?.data?.error || 'Failed to generate token');
    }
  };

  const showTooltip = (content) => {
    setTooltipContent(content);
  };

  const hideTooltip = () => {
    setTooltipContent('');
  };

  const getTooltipContent = (type) => {
    const subscription = subscriptions.find(s => s.id === parseInt(selectedSubscription)) || {};
    switch (type) {
      case 'hourlyRate':
        return `Hourly Rate:
Cost (${subscription.currency || 'N/A'}) / (Days * 24h)
${subscription.cost || 0} / (${subscription.duration_days || 1} * 24)
= ${hourlyRate?.toFixed(2) || '0.00'} TZS`;
      case 'discountedRate':
        return `Discounted Rate:
Rate * (1 - Discount)
${hourlyRate?.toFixed(2) || '0.00'} * (1 - ${discount || 0})
= ${((hourlyRate || 0) * (1 - (discount || 0))).toFixed(2)} TZS`;
      case 'groupDiscount':
        return `Group Discount:
5% per customer, max 15% min
(${activeCustomers || 0} * 0.05, 0.15)
= ${((discount || 0) * 100).toFixed(2)}%`;
      case 'remainingHours':
        return `Remaining Hours:
(End Date - Now) in hours
= ${remainingHours || 0} hours`;
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Generate Token</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="customer">Customer:</label>
          <select id="customer" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.full_name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="subscription">Service Subscription:</label>
          <select id="subscription" value={selectedSubscription} onChange={(e) => handleSubscriptionChange(e.target.value)} required>
            {subscriptions.map(subscription => (
              <option key={subscription.id} value={subscription.id}>{subscription.service_name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amountPaid">Amount Paid (TZS):</label>
          <input
            id="amountPaid"
            type="number"
            value={amountPaid}
            onChange={handleAmountPaidChange}
            placeholder="Amount Paid (TZS)"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="hoursPurchased">Hours Purchased:</label>
          <input
            id="hoursPurchased"
            type="number"
            value={hoursPurchased}
            onChange={handleHoursPurchasedChange}
            placeholder="Hours Purchased"
            required
          />
        </div>
        <div className="info-group">
          <p>
            Hourly Rate: {hourlyRate?.toFixed(2) || '0.00'} TZS
            <span className="tooltip-trigger">
              <span className="info-icon">ℹ️</span>
              <span className="tooltip"><pre>{getTooltipContent('hourlyRate')}</pre></span>
            </span>
          </p>
          <p>
            Discounted Rate: {((hourlyRate || 0) * (1 - (discount || 0))).toFixed(2)} TZS
            <span className="tooltip-trigger">
              <span className="info-icon">ℹ️</span>
              <span className="tooltip"><pre>{getTooltipContent('discountedRate')}</pre></span>
            </span>
          </p>
          <p>
            Group Discount: {((discount || 0) * 100).toFixed(2)}%
            <span className="tooltip-trigger">
              <span className="info-icon">ℹ️</span>
              <span className="tooltip"><pre>{getTooltipContent('groupDiscount')}</pre></span>
            </span>
          </p>
          <p>
            Remaining Hours: {remainingHours || 0}
            <span className="tooltip-trigger">
              <span className="info-icon">ℹ️</span>
              <span className="tooltip"><pre>{getTooltipContent('remainingHours')}</pre></span>
            </span>
          </p>
          <p>Active Customers: {activeCustomers || 0}</p>
        </div>
        {tooltipContent && (
          <div className="tooltip">
            <pre>{getTooltipContent(tooltipContent)}</pre>
          </div>
        )}
        {!showConfirmation ? (
          <div className="button-group">
            <button onClick={handleGenerateToken}>Generate Token</button>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <div className="confirmation">
            <h3>Confirm Purchase</h3>
            <p>Customer: {customers.find(c => c.id === parseInt(selectedCustomer))?.full_name}</p>
            <p>Service: {subscriptions.find(s => s.id === parseInt(selectedSubscription))?.service_name}</p>
            <p>Amount Paid: {amountPaid} TZS</p>
            <p>Hours Purchased: {hoursPurchased}</p>
            <p>Discount Applied: {(discount * 100).toFixed(2)}%</p>
            <div className="button-group">
              <button onClick={confirmPurchase}>Confirm</button>
              <button onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerateTokenModal;
