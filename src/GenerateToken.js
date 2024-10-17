import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';

function GenerateToken() {
  const { customerId, subscriptionId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerAndSubscription();
  }, [customerId, subscriptionId]);

  const fetchCustomerAndSubscription = async () => {
    const customerResponse = await api.get(`/customers/${customerId}`);
    const subscriptionResponse = await api.get(`/subscriptions/${subscriptionId}`);
    setCustomer(customerResponse.data);
    setSubscription(subscriptionResponse.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/generate-token', {
        customerId,
        subscriptionId,
        amount: parseFloat(amount)
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error generating token:', error);
    }
  };

  if (!customer || !subscription) return <div>Loading...</div>;

  return (
    <div className="generate-token">
      <h2>Generate Token for {customer.full_name}</h2>
      <p>Service: {subscription.service_name}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (TZS)"
          required
        />
        <button type="submit">Generate Token</button>
      </form>
    </div>
  );
}

export default GenerateToken;