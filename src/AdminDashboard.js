import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './AdminDashboard.css';
import { FaUsers, FaKey, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';

// New components for modals
import SubscriptionModal from './SubscriptionModal';
import CustomerModal from './CustomerModal';
import ConfirmationDialog from './ConfirmationDialog';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [persistentNotification, setPersistentNotification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (subscriptions.length === 0) {
      setShowSubscriptionModal(true);
      setPersistentNotification('No active subscriptions. Please add a subscription.');
    } else {
      setShowSubscriptionModal(false);
      setPersistentNotification('');
    }
  }, [subscriptions]);

  const fetchCustomers = () => {
    api.get('/customers')
      .then(response => setCustomers(response.data))
      .catch(error => {
        console.error('Error fetching customers:', error);
        setError('Error fetching customers. Please try again.');
      });
  };

  const fetchSubscriptions = () => {
    api.get('/subscriptions')
      .then(response => setSubscriptions(response.data))
      .catch(error => {
        console.error('Error fetching subscriptions:', error);
        setError('Error fetching subscriptions. Please try again.');
      });
  };

  const handleLogout = () => {
    setConfirmationMessage('Are you sure you want to log out?');
    setConfirmationAction(() => () => {
      localStorage.removeItem('token');
      navigate('/login');
    });
    setShowConfirmationDialog(true);
  };

  const handleAddCustomer = () => {
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = (customerId, customerName) => {
    setConfirmationMessage(`Are you sure you want to delete customer "${customerName}"?`);
    setConfirmationAction(() => () => {
      api.delete(`/customers/${customerId}`)
        .then(() => {
          fetchCustomers();
          setError('');
        })
        .catch(error => {
          console.error('Error deleting customer:', error);
          setError('Error deleting customer. Please try again.');
        });
    });
    setShowConfirmationDialog(true);
  };

  const handleDeleteSubscription = (subscriptionId, providerName) => {
    setConfirmationMessage(`Are you sure you want to delete the subscription for "${providerName}"?`);
    setConfirmationAction(() => () => {
      api.delete(`/subscriptions/${subscriptionId}`)
        .then(() => {
          fetchSubscriptions();
          setError('');
        })
        .catch(error => {
          console.error('Error deleting subscription:', error);
          setError('Error deleting subscription. Please try again.');
        });
    });
    setShowConfirmationDialog(true);
  };

  const renderOverview = () => (
    <div className="overview-section">
      <h2>Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <FaUsers className="stat-icon" />
          <h3>Total Customers</h3>
          <p>{customers.length}</p>
        </div>
        <div className="stat-card">
          <FaClipboardList className="stat-icon" />
          <h3>Active Subscriptions</h3>
          <p>{subscriptions.length}</p>
        </div>
      </div>
    </div>
  );

  const renderCustomerManagement = () => (
    <div className="customer-management-section">
      <h2>Customer Management</h2>
      <button onClick={handleAddCustomer}>Add New Customer</button>
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.fullName}</td>
              <td>{customer.email}</td>
              <td>{customer.phoneNumber}</td>
              <td>
                <button onClick={() => handleDeleteCustomer(customer.id, customer.fullName)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTokenGeneration = () => (
    <div className="token-generation-section">
      <h2>Token Generation</h2>
      <form className="token-form">
        <select className="form-input">
          <option value="">Select Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
        <input type="number" className="form-input" placeholder="Amount Paid (TZS)" />
        <button type="submit" className="generate-button">Generate Token</button>
      </form>
    </div>
  );

  const renderSubscriptionManagement = () => (
    <div className="subscription-management-section">
      <h2>Subscription Management</h2>
      <table className="subscription-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Expiration Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(subscription => (
            <tr key={subscription.id}>
              <td>{subscription.provider}</td>
              <td>{subscription.expirationDate}</td>
              <td>
                <button className="action-button">Edit</button>
                <button className="action-button">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-button">Add New Subscription</button>
      <button className="add-button" onClick={() => setShowCustomerModal(true)}>Add New Customer</button>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <nav className="main-menu">
        <button className={activeSection === 'overview' ? 'active' : ''} onClick={() => setActiveSection('overview')}>
          Overview
        </button>
        <button className={activeSection === 'customers' ? 'active' : ''} onClick={() => setActiveSection('customers')}>
          Customers
        </button>
        <button className={activeSection === 'tokens' ? 'active' : ''} onClick={() => setActiveSection('tokens')}>
          Generate Tokens
        </button>
        <button className={activeSection === 'subscriptions' ? 'active' : ''} onClick={() => setActiveSection('subscriptions')}>
          Subscriptions
        </button>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </nav>
      <main className="dashboard-content">
        {persistentNotification && (
          <div className="persistent-notification">{persistentNotification}</div>
        )}
        {error && <div className="error-message">{error}</div>}
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'customers' && renderCustomerManagement()}
        {activeSection === 'tokens' && renderTokenGeneration()}
        {activeSection === 'subscriptions' && renderSubscriptionManagement()}
      </main>
      
      <SubscriptionModal
        show={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onAdd={(newSubscription) => {
          fetchSubscriptions();
          setShowSubscriptionModal(false);
        }}
      />
      
      <CustomerModal
        show={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onAdd={(newCustomer) => {
          fetchCustomers();
          setShowCustomerModal(false);
        }}
      />
      
      <ConfirmationDialog
        show={showConfirmationDialog}
        onConfirm={() => {
          confirmationAction();
          setShowConfirmationDialog(false);
        }}
        onCancel={() => setShowConfirmationDialog(false)}
        message={confirmationMessage}
      />
    </div>
  );
}

export default AdminDashboard;