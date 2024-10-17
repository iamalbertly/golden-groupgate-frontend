import React, { useState } from 'react';
import api from './api';

function DecodeToken() {
  const [token, setToken] = useState('');
  const [decodedInfo, setDecodedInfo] = useState(null);
  const [error, setError] = useState('');

  const handleDecode = async () => {
    try {
      const response = await api.post('/decodeToken', { token });
      setDecodedInfo(response.data);
      setError('');
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Invalid token or decoding failed');
      setDecodedInfo(null);
    }
  };

  return (
    <div className="decode-token">
      <h1>Decode Token</h1>
      <div className="token-input">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter token"
        />
        <button onClick={handleDecode} className="btn btn-primary">Decode</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {decodedInfo && (
        <div className="decoded-info">
          <h2>Decoded Information</h2>
          <p><strong>User ID:</strong> {decodedInfo.userId}</p>
          <p><strong>Expiration:</strong> {new Date(decodedInfo.expiresAt).toLocaleString()}</p>
          {/* Add more decoded information as needed */}
        </div>
      )}
    </div>
  );
}

export default DecodeToken;