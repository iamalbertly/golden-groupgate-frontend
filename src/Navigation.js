import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

function Navigation({ user, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/token-operations">Token Operations</Link>
      <Link to="/customers">Customer Management</Link>
      <Link to="/subscriptions">Subscription Management</Link> {/* Add this line */}
      <div className="user-info">
        {user && <span>Logged in as: {user.username}</span>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navigation;