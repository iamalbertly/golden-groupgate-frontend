import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './AdminDashboard.css';
import { FaUsers, FaKey, FaClipboardList, FaSignOutAlt, FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import EditSubscriptionModal from './EditSubscriptionModal';
import SubscriptionModal from './SubscriptionModal';
import CustomerModal from './CustomerModal';
import ConfirmationDialog from './ConfirmationDialog';
import EditCustomerModal from './EditCustomerModal';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [persistentNotification, setPersistentNotification] = useState('');
  const [showEditSubscriptionModal, setShowEditSubscriptionModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('groupSize');
  const [expandedSubscriptions, setExpandedSubscriptions] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [amountPaid, setAmountPaid] = useState(1000);
  const [hoursPurchased, setHoursPurchased] = useState(0);
  const [showConfirmPurchase, setShowConfirmPurchase] = useState(false);
  const [remainingHours, setRemainingHours] = useState(0);
  const [tokenToDecode, setTokenToDecode] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchSubscriptions();
    fetchTokens();
  }, []);


  useEffect(() => {
    if (customers.length > 0) {
      setSelectedCustomer(customers[0].id);
    }
    if (subscriptions.length > 0) {
      setSelectedService(subscriptions[0].service_name);
    }
  }, [customers, subscriptions]);

  useEffect(() => {
    if (selectedService) {
      handleServiceChange(selectedService);
    }
  }, [selectedService]);


  useEffect(() => {
    if (subscriptions.length === 0) {
      setShowSubscriptionModal(true);
      setPersistentNotification('No active subscriptions. Please add a subscription.');
    } else {
      setShowSubscriptionModal(false);
      setPersistentNotification('');
    }
  }, [subscriptions]);


  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey(oldKey => oldKey + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);


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
      .then(response => {
        setSubscriptions(response.data);
      })
      .catch(error => {
        console.error('Error fetching subscriptions:', error);
        setError('Error fetching subscriptions. Please try again.');
      });
  };

  const fetchTokens = () => {
    api.get('/tokens')
      .then(response => {
        setTokens(response.data);
      })
      .catch(error => {
        console.error('Error fetching tokens:', error);
        setError('Error fetching tokens. Please try again.');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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

  const handleAddSubscription = (newSubscription) => {
    setSubscriptions(prevSubscriptions => [...prevSubscriptions, newSubscription]);
  };


  const handleEditSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowEditSubscriptionModal(true);
  };

  const handleUpdateSubscription = (updatedSubscription) => {
    setSubscriptions(prevSubscriptions => 
      prevSubscriptions.map(sub => 
        sub.id === updatedSubscription.id ? updatedSubscription : sub
      )
    );
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


  const calculateRemainingTime = (createdAt, durationDays) => {
    const createdDate = new Date(createdAt);
    const endDate = new Date(createdDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remainingTime = endDate - now;

    if (remainingTime < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    const totalDuration = durationDays * 24 * 60 * 60 * 1000;
    const warningThreshold = totalDuration * 0.25;

    return {
      days,
      hours,
      minutes,
      seconds,
      expired: remainingTime < 0,
      warning: remainingTime < warningThreshold
    };
  };


  const calculateHoursPurchased = (amount, rate) => {
    const hours = Math.floor(amount / rate);
    return hours;
  };

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleServiceChange = (serviceName) => {
    setSelectedService(serviceName);
    api.get(`/service-rate/${serviceName}`)
      .then(response => {
        const rateInTZS = response.data.rate;
        const activeCustomers = customers.filter(customer => customer.subscriptionId === serviceName).length;
        const discountFactor = activeCustomers > 0 ? 1 - (activeCustomers * 0.05) : 1; // 5% discount per active customer
        const adjustedRate = rateInTZS * discountFactor;
        setHourlyRate(adjustedRate);
        if (adjustedRate > 0) {
          setHoursPurchased(calculateHoursPurchased(amountPaid, adjustedRate));
        } else {
          setHoursPurchased(0); // Prevent division by zero
        }
      })
      .catch(error => {
        console.error('Error fetching service rate:', error);
        setError('Error fetching service rate. Please try again.');
      });

    api.get(`/remaining-hours/${serviceName}`)
      .then(response => {
        setRemainingHours(response.data.remainingHours);
      })
      .catch(error => {
        console.error('Error fetching remaining hours:', error);
        setError('Error fetching remaining hours. Please try again.');
      });
  };

  useEffect(() => {
    if (hourlyRate > 0) {
      setHoursPurchased(calculateHoursPurchased(amountPaid, hourlyRate));
    } else {
      setHoursPurchased(0); // Prevent division by zero
    }
  }, [amountPaid, hourlyRate]);

  const handleAmountPaidChange = (amount) => {
    const newAmount = Math.max(1000, Number(amount));
    setAmountPaid(newAmount);
  };


  const handleGenerateToken = () => {
    if (customers.length === 0) {
      alert('No customers available. Please add a customer first.');
      return;
    }
    setShowConfirmPurchase(true);
  };

  const confirmPurchase = () => {
    const customerId = document.querySelector('select[name="customer"]').value;
    if (!customerId || !amountPaid || !hoursPurchased || !selectedService) {
        setError('Please ensure all fields are filled out correctly before confirming the purchase.');
        return;
    }

    if (hoursPurchased > remainingHours) {
      setError('The hours you are trying to purchase exceed the available hours for this service.');
      return;
    }

    api.post('/generateToken', { customerId, amountPaid, hoursPurchased, service: selectedService })
      .then(response => {
        setTokens(prevTokens => [response.data, ...prevTokens]);
        setError('');
        setShowConfirmPurchase(false);
        setSelectedService('');
        setAmountPaid(1000);
        setHoursPurchased(0);
      })
      .catch(error => {
        console.error('Error generating token:', error);
        setError(`Error generating token: ${error.response?.data?.error || error.message}`);
      });
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditCustomerModal(true);
  };

  const handleDecodeToken = () => {
    if (!tokenToDecode.trim()) {
      setError('Please enter a token to decode');
      return;
    }

    api.post('/decodeToken', { token: tokenToDecode })
      .then(response => {
        setDecodedToken(response.data);
        setError(''); // Clear any previous errors
      })
      .catch(error => {
        console.error('Error decoding token:', error);
        setError('Error decoding token: ' + (error.response?.data?.error || error.message));
        setDecodedToken(null); // Clear any previous decoded token
      });
  };

  const renderOverview = () => {
    const currentDate = new Date();
    const activeSubscriptions = subscriptions.filter(sub => {
      const endDate = new Date(sub.start_date);
      endDate.setDate(endDate.getDate() + sub.duration_days);
      return endDate > currentDate;
    });


    const sortSubscriptions = (subs) => {
      switch(sortBy) {
        case 'groupSize':
          return subs.sort((a, b) => getSubscribedCustomers(b.id).length - getSubscribedCustomers(a.id).length);
        case 'alphabetical':
          return subs.sort((a, b) => a.service_name.localeCompare(b.service_name));
        case 'expiration':
          return subs.sort((a, b) => {
            const aEndDate = new Date(a.start_date);
            aEndDate.setDate(aEndDate.getDate() + a.duration_days);
            const bEndDate = new Date(b.start_date);
            bEndDate.setDate(bEndDate.getDate() + b.duration_days);
            return aEndDate - bEndDate;
          });
        default:
          return subs;
      }
    };

    const getSubscribedCustomers = (subscriptionId) => {
      return customers.filter(customer => customer.subscriptionId === subscriptionId);
    };


    const calculateRemainingTime = (subscription) => {
      const startDate = new Date(subscription.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + subscription.duration_days);
      const remainingTime = endDate - currentDate;

      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      const totalDuration = subscription.duration_days * 24 * 60 * 60 * 1000;
      const warningThreshold = totalDuration * 0.25;

      return {
        days,
        hours,
        minutes,
        seconds,
        warning: remainingTime < warningThreshold
      };
    };


    const toggleExpand = (subscriptionId) => {
      setExpandedSubscriptions(prev => ({
        ...prev,
        [subscriptionId]: !prev[subscriptionId]
      }));
    };

    const navigateToTokenGeneration = (serviceName, isNewCustomer = false) => {
      setActiveSection('tokens');
      setSelectedService(serviceName);
    };

    const calculateTotalPurchased = (subscriptionId) => {
      return 0;
    };


    return (
      <div className="overview-section">
        <h2>Active Subscriptions</h2>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="groupSize">Sort by Group Size</option>
          <option value="alphabetical">Sort Alphabetically</option>
          <option value="expiration">Sort by Expiration Date</option>
        </select>
        {sortSubscriptions(activeSubscriptions).map(subscription => {
          const subscribedCustomers = getSubscribedCustomers(subscription.id);
          const remainingTime = calculateRemainingTime(subscription);
          const totalPurchased = calculateTotalPurchased(subscription.id);
          return (
            <div key={subscription.id} className="subscription-card">
              <h3>{subscription.service_name}</h3>
              <div className="subscription-details">
                <div className="remaining-time">
                  <h4>Remaining Time:</h4>
                  <p>{`${remainingTime.days}d ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`}</p>
                  {remainingTime.warning && <FaExclamationTriangle style={{ color: 'orange' }} />}
                </div>
                <div className="status-box">
                  <p>Active Customers: {subscribedCustomers.length}</p>
                  <p>Expires: {new Date(subscription.start_date).toLocaleDateString()}</p>
                  <p>Total Cost: {(subscription.cost_usd * 2800).toFixed(2)} TZS</p>
                  <p>Total Purchased: {totalPurchased.toFixed(2)} TZS</p>
                  <button onClick={() => navigateToTokenGeneration(subscription.service_name)}>Add Hours</button>
                  <button onClick={() => navigateToTokenGeneration(subscription.service_name, true)}>Add Customer to Service</button>
                </div>
              </div>
              <button onClick={() => toggleExpand(subscription.id)}>
                {expandedSubscriptions[subscription.id] ? <FaChevronUp /> : <FaChevronDown />}
                {expandedSubscriptions[subscription.id] ? 'Hide' : 'Show'} Customers
              </button>
              {expandedSubscriptions[subscription.id] && (
                <div className="customer-list">
                  {subscribedCustomers.slice(0, 10).map(customer => (
                    <p key={customer.id}>{customer.full_name} - Remaining Hours: {calculateRemainingHours(customer.id)}</p>
                  ))}
                  {subscribedCustomers.length > 10 && (
                    <button>Show More</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };


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
            <th>Remaining Hours</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => {
            const remainingHours = calculateRemainingHours(customer.id);
            return (
              <tr key={customer.id}>
                <td>{customer.full_name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone_number}</td>
                <td>{remainingHours}</td>
                <td>
                  <button onClick={() => handleEditCustomer(customer)}>Edit</button>
                  <button onClick={() => handleDeleteCustomer(customer.id, customer.full_name)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showEditCustomerModal && selectedCustomer && (
        <EditCustomerModal
          isOpen={showEditCustomerModal}
          onClose={() => setShowEditCustomerModal(false)}
          customer={selectedCustomer}
          onUpdate={handleUpdateCustomer}
        />
      )}
    </div>
  );

  const renderTokenGeneration = () => (
    <div className="token-generation-section">
      <h2>Token Generation</h2>
      <form className="token-form" onSubmit={(e) => {
        e.preventDefault();
        if (amountPaid < 1000 || amountPaid > remainingHours * hourlyRate) {
          setError('Amount Paid must be between 1000 TZS and the maximum based on remaining hours.');
          return;
        }
        handleGenerateToken();
      }}>
        <select name="customer" className="form-input" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required>
          <option value="">Select Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.full_name}</option>
          ))}
        </select>
        <select 
          value={selectedService} 
          onChange={(e) => handleServiceChange(e.target.value)} 
          className="form-input" 
          required
        >
          <option value="">Select AI Service</option>
          {subscriptions.map(sub => (
            <option key={sub.id} value={sub.service_name}>{sub.service_name}</option>
          ))}
        </select>
        <p>Hourly Rate: {formatNumberWithCommas(hourlyRate.toFixed(2))} TZS</p>
        <input 
          type="number" 
          value={amountPaid} 
          onChange={(e) => handleAmountPaidChange(e.target.value)} 
          min="1000" 
          step="100" 
          className="form-input" 
          placeholder="Amount Paid (TZS)" 
          required 
        />
        <p>Hours to be purchased: {hoursPurchased}</p>
        <div className="remaining-hours">
          <p>Remaining Hours for Service: {remainingHours.toFixed(2)}</p>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{width: `${(hoursPurchased / remainingHours) * 100}%`}}
            ></div>
          </div>
        </div>
        <button type="submit" className="generate-button" disabled={hoursPurchased === 0}>Generate Token</button>
      </form>

      {showConfirmPurchase && (
        <div className="confirmation-dialog">
          <h3>Confirm Purchase</h3>
          <p>Service: {selectedService}</p>
          <p>Amount Paid: {amountPaid} TZS</p>
          <p>Hours to be Purchased: {hoursPurchased}</p>
          <button onClick={confirmPurchase}>Confirm</button>
          <button onClick={() => setShowConfirmPurchase(false)}>Cancel</button>
        </div>
      )}

      <h3>Generated Tokens</h3>
      <table className="tokens-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Customer ID</th>
            <th>Amount Paid (TZS)</th>
            <th>Hours Purchased</th>
            <th>Service</th>
            <th>Expires At</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(token => (
            <tr key={token.id}>
              <td>{token.token}</td>
              <td>{token.customerId}</td>
              <td>{token.amountPaid}</td>
              <td>{token.hoursPurchased}</td>
              <td>{token.service}</td>
              <td>{new Date(token.expires_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Token Decoder</h3>
      <div className="token-decoder">
        <input 
          type="text" 
          placeholder="Enter token to decode (e.g., 1234 5678 9012 3456)" 
          value={tokenToDecode}
          onChange={(e) => setTokenToDecode(e.target.value)}
        />
        <button onClick={handleDecodeToken}>Decode Token</button>
        {decodedToken && (
          <div className="decoded-token-info">
            <p>Customer ID: {decodedToken.customerId}</p>
            <p>Service ID: {decodedToken.serviceId}</p>
            <p>Purchase Date: {new Date(decodedToken.purchaseDate).toLocaleString()}</p>
            <p>Hours Allocated: {decodedToken.hoursAllocated}</p>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );


  const renderSubscriptionManagement = () => (
    <div className="subscription-management-section">
      <h2>Subscription Management</h2>
      <button className="add-button" onClick={() => setShowSubscriptionModal(true)}>Add New Subscription</button>
      <table className="subscription-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Cost (USD)</th>
            <th>Duration (Days)</th>
            <th>Start Date</th>
            <th>Remaining Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(subscription => {
            const { days, hours, minutes, seconds, expired, warning } = calculateRemainingTime(subscription.start_date, subscription.duration_days);
            return (
              <tr key={subscription.id} style={{ color: expired ? 'red' : 'black' }}>
                <td>{subscription.service_name}</td>
                <td>{subscription.cost_usd}</td>
                <td>{subscription.duration_days}</td>
                <td>{new Date(subscription.start_date).toLocaleDateString()}</td>
                <td>
                  {expired ? (
                    <span>Expired</span>
                  ) : (
                    <span>{`${days}d ${hours}h ${minutes}m ${seconds}s`}</span>
                  )}
                  {warning && <FaExclamationTriangle style={{ color: 'orange', marginLeft: '5px' }} />}
                </td>
                <td>
                  <button className="action-button" onClick={() => handleEditSubscription(subscription)}>Edit</button>
                  <button className="action-button" onClick={() => handleDeleteSubscription(subscription.id, subscription.service_name)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );


  const calculateRemainingHours = (customerId) => {
    return 0;
  };


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
        onAdd={handleAddSubscription}
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
      
      {showEditSubscriptionModal && selectedSubscription && (
        <EditSubscriptionModal
          isOpen={showEditSubscriptionModal}
          onClose={() => setShowEditSubscriptionModal(false)}
          subscription={selectedSubscription}
          onUpdate={handleUpdateSubscription}
        />
      )}
    </div>
  );
}


export default AdminDashboard;