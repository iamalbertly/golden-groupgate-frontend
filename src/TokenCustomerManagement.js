import React, { useState, useEffect } from 'react';
import api from './api';
import './TokenCustomerManagement.css';

function TokenCustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchTokens();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await api.get('/tokens');
      setTokens(response.data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const handleGenerateToken = async () => {
    if (!selectedCustomer || !amountPaid) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await api.post('/generateToken', { customerId: selectedCustomer, amountPaid });
      setGeneratedToken(response.data.token);
      fetchTokens();
    } catch (error) {
      console.error('Error generating token:', error);
      setError('Error generating token. Please try again.');
    }
  };

  return (
    <div className="token-customer-management">
      <h1>Token & Customer Management</h1>
      <div className="customer-section">
        <h2>Customers</h2>
        <ul>
          {customers.map(customer => (
            <li key={customer.id} onClick={() => setSelectedCustomer(customer.id)}>
              {customer.full_name}
            </li>
          ))}
        </ul>
      </div>
      <div className="token-section">
        <h2>Generate Token</h2>
        <input
          type="number"
          placeholder="Amount Paid (TZS)"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />
        <button onClick={handleGenerateToken}>Generate Token</button>
        {generatedToken && <div>Generated Token: {generatedToken}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="tokens-list">
        <h2>Tokens</h2>
        <ul>
          {tokens.map(token => (
            <li key={token.id}>
              {token.value} - {new Date(token.expiresAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TokenCustomerManagement;