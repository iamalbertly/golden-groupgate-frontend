import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TokenGeneration({ setMessage, setError }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');

  useEffect(() => {
    // Fetch customers for the dropdown
    axios.get('http://localhost:5000/customers')
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
        setError('Error fetching customers. Please try again.');
      });
  }, []);

  const handleGenerateToken = () => {
    if (!selectedCustomerId || !amountPaid) {
      setError('All fields are required');
      return;
    }

    // Convert amount to hours (assuming a conversion rate of 1000 TZS per hour)
    const conversionRate = 1000; // Example conversion rate
    const hoursPurchased = amountPaid / conversionRate;

    axios.post('http://localhost:5000/generateToken', { customerId: selectedCustomerId, amountPaid, hoursPurchased })
      .then(response => {
        setGeneratedToken(response.data.token); // Display the generated token
        setMessage('Token generated successfully');
      })
      .catch(error => {
        console.error('Error generating token:', error);
        setError('Error generating token. Please try again.');
      });
  };

  return (
    <div>
      <h2>Token Generation</h2>
      <div>
        <label>Select Customer:</label>
        <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
          <option value="">Select a customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.username}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Amount Paid (TZS):</label>
        <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
      </div>
      <button onClick={handleGenerateToken}>Generate Token</button>
      {generatedToken && <div>Generated Token: {generatedToken}</div>} {/* Display the token */}
    </div>
  );
}

export default TokenGeneration;