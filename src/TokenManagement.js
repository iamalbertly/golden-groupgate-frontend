import React, { useState, useEffect } from 'react';
import api from './api';

function TokenManagement() {
  const [tokens, setTokens] = useState([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await api.get('/tokens');
      setTokens(response.data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const handleGenerateToken = () => {
    setShowGenerateModal(true);
  };

  const handleDeleteToken = async (tokenId) => {
    if (window.confirm('Are you sure you want to delete this token?')) {
      try {
        await api.delete(`/tokens/${tokenId}`);
        fetchTokens();
      } catch (error) {
        console.error('Error deleting token:', error);
      }
    }
  };

  return (
    <div className="token-management">
      <h1>Token Management</h1>
      <div className="actions">
        <button onClick={handleGenerateToken} className="btn btn-primary">Generate Token</button>
      </div>
      <table className="token-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Generated At</th>
            <th>Expires At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(token => (
            <tr key={token.id}>
              <td>{token.value}</td>
              <td>{new Date(token.generatedAt).toLocaleString()}</td>
              <td>{new Date(token.expiresAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDeleteToken(token.id)} className="btn btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Generate Token Modal */}
    </div>
  );
}

export default TokenManagement;