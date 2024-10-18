import React, { useState, useEffect } from 'react';
import api from './api';
import './SubscriptionManagement.css';
import EditSubscriptionModal from './EditSubscriptionModal';
import AddCustomerModal from './AddCustomerModal';
import SubscriptionModal from './SubscriptionModal';
import GenerateTokenModal from './GenerateTokenModal';

function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
    fetchCustomerCounts();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      setError('Failed to fetch subscriptions. Please try again.');
    }
  };

  const fetchCustomerCounts = async () => {
    try {
      const response = await api.get('/subscription-customer-counts');
      setCustomerCounts(response.data);
    } catch (error) {
      console.error('Failed to fetch customer counts:', error);
    }
  };

  const handleEditClick = (subscription) => {
    setSelectedSubscription(subscription);
    setShowEditModal(true);
  };

  const handleUpdateSubscription = (updatedSubscription) => {
    setSubscriptions(subs => subs.map(sub => sub.id === updatedSubscription.id ? updatedSubscription : sub));
    setShowEditModal(false);
  };

  const handleAddCustomer = (subscriptionId) => {
    setSelectedSubscription(subscriptions.find(sub => sub.id === subscriptionId));
    setShowAddCustomerModal(true);
  };

  const handleCustomerAdded = (customerData) => {
    fetchCustomerCounts();
    setShowAddCustomerModal(false);
    setSelectedCustomerForToken(customerData);
    setShowGenerateTokenModal(true);
  };

  const handleAddSubscription = () => {
    setShowAddSubscriptionModal(true);
  };

  const handleSubscriptionAdded = () => {
    fetchSubscriptions();
    setShowAddSubscriptionModal(false);
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    try {
      await api.delete(`/subscriptions/${subscriptionId}`);
      fetchSubscriptions(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setError('Failed to delete subscription: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="subscription-management">
      <h1>Subscription Management</h1>
      {error && <div className="error-message">{error}</div>}
      <button onClick={handleAddSubscription}>Add Subscription</button>
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Start Date</th>
            <th>Duration (days)</th>
            <th>Current Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(sub => (
            <tr key={sub.id}>
              <td>{sub.service_name}</td>
              <td>{new Date(sub.start_date).toLocaleDateString()}</td>
              <td>{sub.duration_days}</td>
              <td>${sub.current_rate}/hour</td>
              <td>
                <button onClick={() => handleEditClick(sub)}>Edit</button>
                <button onClick={() => handleAddCustomer(sub.id)}>
                  Add Customer ({customerCounts[sub.id] || 0})
                </button>
                {customerCounts[sub.id] === 0 && (
                  <button onClick={() => handleDeleteSubscription(sub.id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showEditModal && selectedSubscription && (
        <EditSubscriptionModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          subscription={selectedSubscription}
          onUpdate={handleUpdateSubscription}
        />
      )}
      {showAddCustomerModal && selectedSubscription && (
        <AddCustomerModal
          isOpen={showAddCustomerModal}
          onClose={() => setShowAddCustomerModal(false)}
          onCustomerAdded={handleCustomerAdded}
          subscriptionId={selectedSubscription.id}
        />
      )}
      {showAddSubscriptionModal && (
        <SubscriptionModal
          show={showAddSubscriptionModal}
          onClose={() => setShowAddSubscriptionModal(false)}
          onAdd={handleSubscriptionAdded}
        />
      )}
      {showGenerateTokenModal && selectedSubscription && selectedCustomerForToken && (
        <GenerateTokenModal
          isOpen={showGenerateTokenModal}
          onClose={() => setShowGenerateTokenModal(false)}
          onTokenGenerated={() => {
            setShowGenerateTokenModal(false);
            // Optionally, refresh data or show a success message
          }}
          customer={selectedCustomerForToken}
          subscription={selectedSubscription}
        />
      )}
    </div>
  );
}

export default SubscriptionManagement;
