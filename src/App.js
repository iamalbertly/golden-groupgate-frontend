import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the token to get user info (including roles)
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser(decodedToken);
    }
  }, []);

  const PrivateRoute = ({ component: Component, roles, ...rest }) => (
    <Route {...rest} render={props => {
      if (!user) {
        return <Redirect to="/login" />;
      }

      if (roles && !roles.some(role => user.roles.includes(role))) {
        return <Redirect to="/" />;
      }

      return <Component {...props} />;
    }} />
  );

  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <PrivateRoute path="/admin" roles={['admin']} component={AdminDashboard} />
        <PrivateRoute path="/" component={Dashboard} />
      </Switch>
    </Router>
  );
}

export default App;
