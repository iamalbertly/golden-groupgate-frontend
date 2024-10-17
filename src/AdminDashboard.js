import React, { useState, useEffect } from 'react';
import api from './api';
import './AdminDashboard.css';
import GenerateTokenModal from './GenerateTokenModal';
import ConfirmationDialog from './ConfirmationDialog';
import EditCustomerModal from './EditCustomerModal';

function AdminDashboard() {
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState('');
  const [showGenerateTokenModal, setShowGenerateTokenModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tokenToDecode, setTokenToDecode] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [services, setServices] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchSubscriptions();
    fetchTokens();
    fetchServices();
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
      .then(response => setSubscriptions(response.data))
      .catch(error => {
        console.error('Error fetching subscriptions:', error);
        setError('Error fetching subscriptions. Please try again.');
      });
  };

  const fetchTokens = () => {
    api.get('/tokens')
      .then(response => setTokens(response.data))
      .catch(error => {
        console.error('Error fetching tokens:', error);
        setError('Error fetching tokens. Please try again.');
      });
  };

  const fetchServices = () => {
    api.get('/services')
      .then(response => setServices(response.data))
      .catch(error => {
        console.error('Error fetching services:', error);
        setError('Error fetching services. Please try again.');
      });
  };

  const handleDecodeToken = () => {
    const cleanToken = tokenToDecode.replace(/\s/g, '');
    if (cleanToken.length !== 20 || !/^\d+$/.test(cleanToken)) {
      setError('Invalid token format. Please enter a 20-digit numeric token.');
      return;
    }

    api.post('/decodeToken', { token: cleanToken })
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

  const handleDeleteToken = (tokenId) => {
    if (window.confirm('Are you sure you want to delete this token?')) {
      api.delete(`/tokens/${tokenId}`)
        .then(() => {
          setTokens(prevTokens => prevTokens.filter(token => token.id !== tokenId));
          setError('');
        })
        .catch(error => {
          console.error('Error deleting token:', error);
          if (error.response && error.response.status === 404) {
            setError(`Token with ID ${tokenId} not found. It may have been already deleted.`);
            // Remove the token from the local state if it's not found on the server
            setTokens(prevTokens => prevTokens.filter(token => token.id !== tokenId));
          } else {
            setError(`Error deleting token: ${error.response?.data?.error || error.message}`);
          }
        });
    }
  };

  const handleCopyToken = (token) => {
    navigator.clipboard.writeText(token).then(() => {
      alert('Token copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy token: ', err);
      alert('Failed to copy token. Please try again.');
    });
  };

  const formatToken = (token) => {
    // Format the 20-digit token into groups of 4 for better readability
    return token.match(/.{1,4}/g).join(' ');
  };

  const handleAddService = () => {
    // Logic to add a new service
  };

  const handleEditService = (service) => {
    // Logic to edit a service
  };

  const handleDeleteService = (serviceId) => {
    // Logic to delete a service
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {error && <div className="error-message">{error}</div>}
      <button onClick={() => setShowGenerateTokenModal(true)}>Generate Token</button>
      <h3>Customers</h3>
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Services</th>
            <th>Hours Remaining</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.full_name}</td>
              <td>{customer.email}</td>
              <td>{customer.services.join(', ')}</td>
              <td>{customer.hoursRemaining}</td>
              <td>
                <button onClick={() => handleEditCustomer(customer)}>Edit</button>
                <button onClick={() => handleDeleteCustomer(customer.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Services</h3>
      <button onClick={handleAddService}>Add Service</button>
      <table className="service-table">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Price</th>
            <th>Token Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>{service.default_cost}</td>
              <td>{service.token_duration}</td>
              <td>
                <button onClick={() => handleEditService(service)}>Edit</button>
                <button onClick={() => handleDeleteService(service.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(token => (
            <tr key={token.id}>
              <td>{formatToken(token.token)}</td>
              <td>{token.customerId}</td>
              <td>{token.amountPaid}</td>
              <td>{token.hoursPurchased}</td>
              <td>{token.service}</td>
              <td>{new Date(token.expires_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleCopyToken(token.token)}>Copy</button>
                <button onClick={() => handleDeleteToken(token.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Subscription Overview</h3>
      <div className="subscription-overview">
        {activeSubscriptions.length === 0 ? (
          <p>No active subscriptions. <button onClick={() => setShowAddSubscriptionModal(true)}>Add Subscription</button></p>
        ) : (
          <ul>
            {activeSubscriptions.map(sub => (
              <li key={sub.id}>{sub.service_name} - {sub.duration_days} days</li>
            ))}
          </ul>
        )}
      </div>

      <h3>Token Decoder</h3>
      <div className="token-decoder">
        <input 
          type="text" 
          placeholder="Enter 20-digit token (e.g., 1234 5678 9012 3456 7890)" 
          value={tokenToDecode}
          onChange={(e) => setTokenToDecode(e.target.value)}
          maxLength={24} // 20 digits + 4 spaces
        />
        <button onClick={handleDecodeToken}>Decode Token</button>
        {decodedToken && (
          <div className="decoded-token-info">
            <h4>Decoded Token Information</h4>
            <div>
              <p>Customer Name: {decodedToken.customerName}</p>
              <p>Service Name: {decodedToken.serviceName}</p>
              <p>Hours Purchased: {decodedToken.hoursPurchased}</p>
              <p>Amount Paid: {decodedToken.amountPaid} TZS</p>
              <p>Created At: {new Date(decodedToken.createdAt).toLocaleString()}</p>
              <p>Expires At: {new Date(decodedToken.expiresAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {showGenerateTokenModal && (
        <GenerateTokenModal
          isOpen={showGenerateTokenModal}
          onClose={() => setShowGenerateTokenModal(false)}
          onTokenGenerated={fetchTokens}
          customerId={selectedCustomer}
          availableServices={subscriptions.map(sub => sub.service_name)}
          customerDetails={customers.find(c => c.id === selectedCustomer)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;