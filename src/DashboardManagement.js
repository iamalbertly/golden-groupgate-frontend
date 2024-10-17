import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import './DashboardManagement.css';

function DashboardManagement() {
  const [metrics, setMetrics] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchCustomers();
    fetchServices();
    fetchSubscriptions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const metricsResponse = await api.get('/dashboard/metrics');
      const activitiesResponse = await api.get('/dashboard/recent-activities');
      setMetrics(metricsResponse.data);
      setRecentActivities(activitiesResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  return (
    <div className="dashboard-management">
      <div className="header">
        <h1>Dashboard & Management</h1>
        <nav>
          <Link to="/customers" className="btn">Customers</Link>
          <Link to="/subscriptions" className="btn">Subscriptions</Link>
          <Link to="/tokens" className="btn">Tokens</Link>
          <Link to="/decode-token" className="btn">Decode Token</Link>
        </nav>
      </div>
      <div className="card">
        <h2>Key Metrics</h2>
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
      </div>
      <div className="card">
        <h2>Recent Activities</h2>
        <ul className="activity-list">
          {recentActivities.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h2>Customer Overview</h2>
        <table className="overview-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Service</th>
              <th>Hours Remaining</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.full_name}</td>
                <td>{customer.email}</td>
                <td>{customer.services.join(', ')}</td>
                <td>{customer.hoursRemaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Service Management</h2>
        <ul>
          {services.map(service => (
            <li key={service.id}>{service.name} - {service.default_cost}</li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h2>Subscription Overview</h2>
        <ul>
          {subscriptions.map(subscription => (
            <li key={subscription.id}>{subscription.service_name} - {subscription.duration_days} days</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DashboardManagement;