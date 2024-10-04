import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SubscriptionManagement({ setMessage, setError }) {
  const [provider, setProvider] = useState('OpenAI');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [subscriptionCostUSD, setSubscriptionCostUSD] = useState('');
  const [subscriptionCostTZS, setSubscriptionCostTZS] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [hoursPurchased, setHoursPurchased] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = () => {
    axios.get('http://localhost:5000/subscriptions')
      .then(response => {
        setSubscriptions(response.data);
      })
      .catch(error => {
        console.error('Error fetching subscriptions:', error);
        setError(`Error fetching subscriptions: ${error.message}`);
      });
  };

  const handleAddSubscription = () => {
    if (!provider || !purchaseDate || !expirationDate || !subscriptionCostUSD || !subscriptionCostTZS || !conversionRate || !hoursPurchased) {
      setError('All fields are required');
      return;
    }

    const subscriptionData = {
      provider,
      purchaseDate,
      expirationDate,
      subscriptionCostUSD,
      subscriptionCostTZS,
      conversionRate,
      hoursPurchased: parseInt(hoursPurchased, 10)
    };

    axios.post('http://localhost:5000/addSubscription', subscriptionData)
      .then(response => {
        setMessage('Subscription added successfully');
        fetchSubscriptions();
      })
      .catch(error => {
        console.error('Error adding subscription:', error);
        setError(`Error adding subscription: ${error.message}`);
      });
  };

  const handleDeleteSubscription = (id) => {
    axios.delete(`http://localhost:5000/subscriptions/${id}`)
      .then(response => {
        setMessage('Subscription deleted successfully');
        fetchSubscriptions();
      })
      .catch(error => {
        console.error('Error deleting subscription:', error);
        setError(`Error deleting subscription: ${error.message}`);
      });
  };

  return (
    <div>
      <h2>Subscription Management</h2>
      <div>
        <label>Provider:</label>
        <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Enter provider name" />
      </div>
      <div>
        <label>Purchase Date:</label>
        <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
      </div>
      <div>
        <label>Expiration Date:</label>
        <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
      </div>
      <div>
        <label>Subscription Cost (USD):</label>
        <input type="number" value={subscriptionCostUSD} onChange={(e) => setSubscriptionCostUSD(e.target.value)} />
      </div>
      <div>
        <label>Subscription Cost (TZS):</label>
        <input type="number" value={subscriptionCostTZS} onChange={(e) => setSubscriptionCostTZS(e.target.value)} />
      </div>
      <div>
        <label>Conversion Rate:</label>
        <input type="number" value={conversionRate} onChange={(e) => setConversionRate(e.target.value)} />
      </div>
      <div>
        <label>Hours Purchased:</label>
        <input type="number" value={hoursPurchased} onChange={(e) => setHoursPurchased(e.target.value)} />
      </div>
      <button onClick={handleAddSubscription}>Add Subscription</button>

      <h3>Subscriptions ({subscriptions.length})</h3>
      <a href="/subscription-management">Manage Subscriptions</a>
    </div>
  );
}

export default SubscriptionManagement;