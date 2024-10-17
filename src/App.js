import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import TokenOperations from './TokenOperations';
import CustomerManagement from './CustomerManagement';
import Navigation from './Navigation';
import SubscriptionModal from './SubscriptionModal';
import GenerateToken from './GenerateToken';
import api from './api';
import './App.css';
import SubscriptionManagement from './SubscriptionManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [persistentNotification, setPersistentNotification] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await api.get('/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      checkActiveSubscriptions(token);
    } catch (error) {
      console.error('Error fetching user data:', error.response?.data || error.message);
      setError('Failed to fetch user data. ' + (error.response?.data?.details || 'Please try again later.'));
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
  };

  const checkActiveSubscriptions = async (token) => {
    try {
      const response = await api.get('/active-subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.length === 0) {
        setShowSubscriptionModal(true);
      }
    } catch (error) {
      console.error('Error checking active subscriptions:', error.response?.data || error.message);
      setError('Failed to check active subscriptions. ' + (error.response?.data?.details || 'Please try again later.'));
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    fetchUserData(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navigation user={user} onLogout={handleLogout} />}
        {persistentNotification && (
          <div className="persistent-notification">{persistentNotification}</div>
        )}
        {error && <div className="error-message">{error}</div>}
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/token-operations"
            element={isAuthenticated ? <TokenOperations /> : <Navigate to="/login" />}
          />
          <Route
            path="/customers"
            element={isAuthenticated ? <CustomerManagement /> : <Navigate to="/login" />}
          />
          <Route
            path="/generate-token/:customerId/:subscriptionId"
            element={isAuthenticated ? <GenerateToken /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          <Route
            path="/subscriptions"
            element={isAuthenticated ? <SubscriptionManagement /> : <Navigate to="/login" />}
          />
        </Routes>
        {isAuthenticated && showSubscriptionModal && (
          <SubscriptionModal
            show={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
            onAdd={() => {
              setShowSubscriptionModal(false);
              setPersistentNotification(null);
            }}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
