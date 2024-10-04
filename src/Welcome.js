import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Welcome() {
  const [logs, setLogs] = useState([]);
  const [tokenStatus, setTokenStatus] = useState(null);

  useEffect(() => {
    // Fetch user input logs from the backend
    axios.get('http://localhost:5000/logs')
      .then(response => {
        setLogs(response.data);
      })
      .catch(error => {
        console.error('Error fetching logs:', error);
      });

    // Check token validation status
    const token = localStorage.getItem('validToken');
    if (token) {
      axios.post('http://localhost:5000/validateToken', { token })
        .then(response => {
          setTokenStatus(response.data.valid ? 'Valid' : 'Invalid');
        })
        .catch(error => {
          console.error('Error validating token:', error);
          setTokenStatus('Invalid');
        });
    } else {
      setTokenStatus('No token found');
    }
  }, []);

  return (
    <div>
      <h1>Welcome to GroupGate</h1>
      <h2>Token Status: {tokenStatus}</h2>
      <h2>User Input Logs</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <strong>Input:</strong> {log.user_input} <strong>Tokens:</strong> {log.token_count}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Welcome;