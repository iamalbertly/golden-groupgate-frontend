import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css'; // Create a separate CSS file for User Management styles

function CustomerManagement({ setMessage, setError }) {
  const [customerName, setCustomerName] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerTokens, setCustomerTokens] = useState([]);

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
        fetchCustomers();  // Refresh the list of customers
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

  return (
    <div className="customer-management">
      <h2>Customer Management</h2>
      <div className="form-group">
        <label>Add Customer:</label>
        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter customer name" />
        <button onClick={handleAddCustomer}>Add Customer</button>
      </div>
      <div className="customer-list">
        <h3>Customers</h3>
        {customers.map(customer => (
          <div key={customer.id} onClick={() => selectCustomer(customer.id)} className="customer-item">
            {customer.username}
          </div>
        ))}
      </div>
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

export default CustomerManagement;