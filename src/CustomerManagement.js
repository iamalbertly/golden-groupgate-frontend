import React, { useState, useEffect } from 'react';
import api from './api';
import './CustomerManagement.css';
import CustomerModal from './CustomerModal';

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers. Please try again.');
    }
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers([...customers, newCustomer]);
  };

  return (
    <div className="customer-management">
      <h1>Customer Management</h1>
      <button onClick={() => setShowAddCustomerModal(true)}>Add New Customer</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.full_name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone_number}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <CustomerModal
        show={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onAdd={handleAddCustomer}
      />
    </div>
  );
}

export default CustomerManagement;