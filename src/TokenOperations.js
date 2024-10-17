import React, { useState, useEffect } from 'react';
import api from './api';
import './TokenOperations.css';
import GenerateTokenModal from './GenerateTokenModal';

function TokenOperations() {
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [tokenToDecode, setTokenToDecode] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await api.get('/tokens');
      setTokens(response.data);
    } catch (error) {
      setError('Failed to fetch tokens. Please try again.');
    }
  };

  const handleTokenGenerated = (newToken) => {
    setTokens([...tokens, newToken]);
    setShowGenerateModal(false);
  };

  const handleDecodeToken = async () => {
    try {
      const response = await api.post('/decodeToken', { token: tokenToDecode });
      setDecodedToken(response.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to decode token');
      setDecodedToken(null);
    }
  };

  return (
    <div className="token-operations">
      <h1>Token Operations</h1>
      {error && <div className="error-message">{error}</div>}
      <button onClick={() => setShowGenerateModal(true)}>Generate Token</button>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Customer</th>
            <th>Service</th>
            <th>Hours Purchased</th>
            <th>Amount Paid (TZS)</th>
            <th>Discount Applied</th>
            <th>Expires At</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(token => (
            <tr key={token.id}>
              <td>{token.token}</td>
              <td>{token.customerName}</td>
              <td>{token.serviceName}</td>
              <td>{token.hoursPurchased}</td>
              <td>{token.amountPaid}</td>
              <td>{(token.discount * 100).toFixed(2)}%</td>
              <td>{new Date(token.expiresAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <GenerateTokenModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onTokenGenerated={handleTokenGenerated}
      />
      <div className="token-decoder">
        <h2>Decode Token</h2>
        <input
          type="text"
          value={tokenToDecode}
          onChange={(e) => setTokenToDecode(e.target.value)}
          placeholder="Enter token to decode"
        />
        <button onClick={handleDecodeToken}>Decode</button>
        {decodedToken && (
          <div className="decoded-token-info">
            <h3>Decoded Token Information</h3>
            <p>Customer Code: {decodedToken.customerCode}</p>
            <p>Service Code: {decodedToken.serviceCode}</p>
            <p>Customer Name: {decodedToken.customerName}</p>
            <p>Service Name: {decodedToken.serviceName}</p>
            <p>Hours Purchased: {decodedToken.hoursPurchased}</p>
            <p>Amount Paid: {decodedToken.amountPaid} TZS</p>
            <p>Discount Applied: {(decodedToken.discount * 100).toFixed(2)}%</p>
            <p>Created At: {new Date(decodedToken.createdAt).toLocaleString()}</p>
            <p>Expires At: {new Date(decodedToken.expiresAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TokenOperations;