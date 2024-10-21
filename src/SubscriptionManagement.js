import React, { useState, useEffect } from 'react';
import api from './api';
import './SubscriptionManagement.css';
import SubscriptionModal from './SubscriptionModal';
import GenerateTokenModal from './GenerateTokenModal';

function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const [customerCounts, setCustomerCounts] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGenerateTokenModal, setShowGenerateTokenModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
    fetchCustomerCounts();
    const interval = setInterval(() => {
      setSubscriptions((subs) => [...subs]); // Trigger re-render every second
    }, 1000);
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error.response?.data || error.message);
      setError('Failed to load subscriptions. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const fetchCustomerCounts = async () => {
    try {
      const response = await api.get('/subscription-customer-counts');
      const counts = response.data.reduce((acc, item) => {
        acc[item.provider_id] = item.customer_count;
        return acc;
      }, {});
      setCustomerCounts(counts);
    } catch (error) {
      console.error('Error fetching customer counts:', error.response?.data || error.message);
      setError('Failed to load customer counts. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const handleDelete = (subscriptionId) => {
    setSubscriptionToDelete(subscriptionId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/subscriptions/${subscriptionToDelete}`);
      setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionToDelete));
      setShowConfirmation(false);
      setSubscriptionToDelete(null);
    } catch (error) {
      console.error('Error deleting subscription:', error.response?.data || error.message);
      setError('Failed to delete subscription. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setShowEditModal(true);
  };

  const handleAddCustomer = (subscription) => {
    setSelectedSubscription(subscription);
    setShowGenerateTokenModal(true);
  };

  const calculateRemainingTime = (startDate, durationDays) => {
    const endDate = new Date(new Date(startDate).getTime() + durationDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remainingTime = endDate - now;

    const weeks = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor((remainingTime % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${weeks}w ${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="subscription-management">
      <h1>Subscription Management</h1>
      {error && <div className="error-message">{error}</div>}
      <button onClick={() => setShowAddModal(true)}>Add New Subscription</button>
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Cost</th>
            <th>Start Date</th>
            <th>Duration (days)</th>
            <th>Remaining Time</th>
            <th>Customer Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(sub => (
            <tr key={sub.id}>
              <td>{sub.service_name}</td>
              <td>{sub.cost}</td>
              <td>{new Date(sub.start_date).toLocaleDateString()}</td>
              <td>{sub.duration_days}</td>
              <td>{calculateRemainingTime(sub.start_date, sub.duration_days)}</td>
              <td>{customerCounts[sub.provider_id] || 0}</td>
              <td>
                <button onClick={() => handleEdit(sub)}>Edit</button>
                <button onClick={() => handleAddCustomer(sub)}>Add Customer</button>
                <button onClick={() => handleDelete(sub.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showConfirmation && (
        <div className="confirmation-dialog">
          <p>Are you sure you want to delete this subscription? This action is irreversible.</p>
          <button onClick={confirmDelete}>Yes, Delete</button>
          <button onClick={() => setShowConfirmation(false)}>Cancel</button>
        </div>
      )}
      {showEditModal && (
        <SubscriptionModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          onAdd={fetchSubscriptions}
          subscription={selectedSubscription}
        />
      )}
      {showAddModal && (
        <SubscriptionModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={fetchSubscriptions}
        />
      )}
      {showGenerateTokenModal && (
        <GenerateTokenModal
          show={showGenerateTokenModal}
          onClose={() => setShowGenerateTokenModal(false)}
          subscription={selectedSubscription}
        />
      )}
    </div>
  );
}

export default SubscriptionManagement;
