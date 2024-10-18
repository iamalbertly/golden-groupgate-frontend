import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import './Dashboard.css';
import CustomerModal from './CustomerModal';

function Dashboard() {
  const [metrics, setMetrics] = useState({});
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchCustomers();
    fetchSubscriptions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const metricsResponse = await api.get('/dashboard/metrics');
      setMetrics(metricsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error.response?.data || error.message);
      setError('Failed to load dashboard data. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error.response?.data || error.message);
      setError('Failed to load customers. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      const allSubscriptions = response.data;
      const activeSubscriptions = allSubscriptions.filter(sub => sub.is_active === 1);
      setActiveSubscriptions(activeSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error.response?.data || error.message);
      setError('Failed to load subscriptions. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const handleGenerateToken = async (customerId) => {
    // Implement token generation logic
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers([...customers, newCustomer]);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="metrics-grid">
        <div className="metric">
          <h3>Total Customers</h3>
          <p>{metrics.totalCustomers}</p>
        </div>
        <div className="metric">
          <h3>Active Subscriptions</h3>
          <p>{metrics.activeSubscriptions}</p>
        </div>
        <div className="metric">
          <h3>Generated Tokens</h3>
          <p>{metrics.generatedTokens}</p>
        </div>
      </div>
      <div className="customer-list">
        <h2>Customer Profiles</h2>
        <button onClick={() => setShowCustomerModal(true)}>Add New Customer</button>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Tokens</th>
              <th>Total Expiration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.full_name}</td>
                <td>{customer.email}</td>
                <td>{customer.tokenCount}</td>
                <td>{customer.tokenCount > 0 ? new Date(customer.latestExpiration).toLocaleString() : '0'}</td>
                <td>
                  {activeSubscriptions.map(sub => (
                    <Link 
                      key={sub.id} 
                      to={`/generate-token/${customer.id}/${sub.id}`}
                      className="generate-token-btn"
                    >
                      Generate {sub.service_name} Token
                    </Link>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCustomerModal && (
        <CustomerModal
          show={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onAdd={handleAddCustomer}
        />
      )}
    </div>
  );
}

export default Dashboard;
