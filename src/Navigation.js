import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';
import { FaHome, FaUser, FaSignOutAlt, FaList, FaCog } from 'react-icons/fa';

function Navigation({ user, onLogout }) {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/dashboard">GroupGate</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/dashboard"><FaHome /> Dashboard</Link></li>
          <li><Link to="/token-management"><FaList /> Token Management</Link></li>
          <li><Link to="/customers"><FaUser /> Customers</Link></li>
          <li><Link to="/subscriptions"><FaCog /> Subscriptions</Link></li>
        </ul>
        <div className="nav-user">
          <span>{user?.username}</span>
          <button onClick={onLogout}><FaSignOutAlt /> Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
