import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

function UserManagement({ setMessage, setError }) {
  const [customerName, setCustomerName] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerTokens, setCustomerTokens] = useState([]);
  const [amountPaid, setAmountPaid] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    axios.get('http://localhost:5000/customers')
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
        setError('Error fetching customers. Please try again.');
      });
  };

  const handleAddCustomer = () => {
    if (!customerName) {
      setError('Customer name is required');
      return;
    }
    axios.post('http://localhost:5000/addCustomer', { customerName })
      .then(response => {
        setMessage('Customer added successfully');
        fetchCustomers();
      })
      .catch(error => {
        console.error('Error adding customer:', error);
        setError('Error adding customer. Please try again.');
      });
  };

  const selectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    fetchCustomerTokens(customerId);
  };

  const fetchCustomerTokens = (customerId) => {
    axios.get(`http://localhost:5000/customerTokens/${customerId}`)
      .then(response => {
        setCustomerTokens(response.data);
      })
      .catch(error => {
        console.error('Error fetching tokens for customer:', error);
        setError('Error fetching tokens. Please try again.');
      });
  };

  const handleGenerateToken = () => {
    if (!selectedCustomerId || !amountPaid) {
      setError('All fields are required');
      return;
    }

    const conversionRate = 1000; // Example conversion rate
    const hoursPurchased = amountPaid / conversionRate;

    axios.post('http://localhost:5000/generateToken', { customerId: selectedCustomerId, amountPaid, hoursPurchased })
      .then(response => {
        setGeneratedToken(response.data.token);
        setMessage('Token generated successfully');
        fetchCustomerTokens(selectedCustomerId);
      })
      .catch(error => {
        console.error('Error generating token:', error);
        setError('Error generating token. Please try again.');
      });
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <div className="add-customer">
        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter customer name" />
        <button onClick={handleAddCustomer}>Add Customer</button>
      </div>
      <div className="customer-list">
        <h3>Customers</h3>
        {customers.map(customer => (
          <div key={customer.id} onClick={() => selectCustomer(customer.id)} className="customer-item">
            {customer.name}
          </div>
        ))}
      </div>
      {selectedCustomerId && (
        <div className="token-generation">
          <h3>Generate Token</h3>
          <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="Amount Paid (TZS)" />
          <button onClick={handleGenerateToken}>Generate Token</button>
          {generatedToken && <div>Generated Token: {generatedToken}</div>}
        </div>
      )}
      <div className="customer-tokens">
        <h3>Customer Tokens</h3>
        {customerTokens.map(token => (
          <div key={token.id}>
            Token: {token.token}, Time Purchased: {token.time_purchased}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManagement;