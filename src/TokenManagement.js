import React, { useState, useEffect } from 'react';
import api from './api';
import './global.css';
import ConfirmationDialog from './ConfirmationDialog';
import GenerateTokenModal from './GenerateTokenModal';

function TokenManagement() {
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState(null);
  const [tokenToVerify, setTokenToVerify] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showGenerateTokenModal, setShowGenerateTokenModal] = useState(false);

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(() => {
      setTokens((tokens) => [...tokens]); // Trigger re-render every second
    }, 1000);
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await api.get('/tokens');
      setTokens(response.data);
    } catch (error) {
      setError('Failed to load tokens. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const handleVerifyToken = async () => {
    try {
      const response = await api.post('/decodeToken', { token: tokenToVerify });
      setDecodedToken(response.data);
    } catch (error) {
      setError('Failed to verify token. ' + (error.response?.data?.error || 'Please try again.'));
    }
  };

  const calculateRemainingTime = (expiresAt) => {
    const endDate = new Date(expiresAt);
    const now = new Date();
    const remainingTime = endDate - now;

    const weeks = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor((remainingTime % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${weeks}w ${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleDeleteToken = (tokenId) => {
    setTokenToDelete(tokenId);
    setConfirmationMessage('Are you sure you want to delete this token? This action cannot be undone.');
    setConfirmation(true);
  };

  const confirmDeleteToken = async () => {
    try {
      await api.delete(`/tokens/${tokenToDelete}`);
      setTokens(tokens.filter(token => token.id !== tokenToDelete));
      setTokenToDelete(null);
      setConfirmation(false);
    } catch (error) {
      setError('Failed to delete token. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Token copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="token-management">
      <h1>Token Management</h1>
      {error && <div className="error-message">{error}</div>}
      <button onClick={() => setShowGenerateTokenModal(true)}>Generate New Token</button>
      <div className="purchase-details">
        <h2>All Tokens</h2>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Service Subscription</th>
              <th>Customer</th>
              <th>Generated On</th>
              <th>Time on AI Service</th>
              <th>Time Until Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(token => (
              <tr key={token.id}>
                <td>
                  {token.token}
                  <button onClick={() => copyToClipboard(token.token)}>Copy</button>
                </td>
                <td>{token.service_name || 'N/A'}</td>
                <td>{token.customer_name}</td>
                <td>{new Date(token.generated_at).toLocaleString()}</td>
                <td>{token.hoursPurchased} hours</td>
                <td>{calculateRemainingTime(token.expires_at)}</td>
                <td>
                  <button onClick={() => handleDeleteToken(token.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="token-verification">
        <h2>Verify Token</h2>
        <input
          type="text"
          value={tokenToVerify}
          onChange={(e) => setTokenToVerify(e.target.value)}
          placeholder="Enter token to verify"
        />
        <button onClick={handleVerifyToken}>Verify Token</button>
        {decodedToken && (
          <div className="decoded-token">
            <h3>Decoded Token Information:</h3>
            <p>Customer Name: {decodedToken.customerName || 'N/A'}</p>
            <p>Service Name: {decodedToken.serviceName || 'N/A'}</p>
            <p>User Code: {decodedToken.userCode || 'N/A'}</p>
            <p>Service Code: {decodedToken.serviceCode || 'N/A'}</p>
            <p>Generated On: {decodedToken.generatedAt ? new Date(decodedToken.generatedAt).toLocaleString() : 'N/A'}</p>
            <p>Time on AI Service: {decodedToken.hoursPurchased || decodedToken.minutesPurchased / 60 || 'N/A'} hours</p>
            <p>Expiration Date: {decodedToken.expirationDate ? new Date(decodedToken.expirationDate).toLocaleString() : 'N/A'}</p>
            <p>Amount Paid: {decodedToken.amountPaid != null ? `$${decodedToken.amountPaid.toFixed(2)}` : 'N/A'}</p>
            <p>Is Expired: {decodedToken.isExpired ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
      <ConfirmationDialog
        show={confirmation}
        onConfirm={confirmDeleteToken}
        onCancel={() => setConfirmation(false)}
        message={confirmationMessage}
      />
      <GenerateTokenModal
        show={showGenerateTokenModal}
        onClose={() => setShowGenerateTokenModal(false)}
        onTokenGenerated={(newToken) => {
          fetchTokens();
          setShowGenerateTokenModal(false);
        }}
      />
    </div>
  );
}

export default TokenManagement;
