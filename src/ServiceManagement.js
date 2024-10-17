import React, { useState, useEffect } from 'react';
import api from './api';

function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [subscriptionProviders, setSubscriptionProviders] = useState([]);
  const [name, setName] = useState('');
  const [defaultCost, setDefaultCost] = useState('');

  useEffect(() => {
    fetchServices();
    fetchSubscriptionProviders();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchSubscriptionProviders = async () => {
    try {
      const response = await api.get('/subscription-providers');
      setSubscriptionProviders(response.data);
    } catch (error) {
      console.error('Error fetching subscription providers:', error);
    }
  };

  const handleAddService = async () => {
    try {
      await api.post('/services', { name, default_cost: defaultCost });
      fetchServices();
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  return (
    <div className="service-management">
      <h2>Subscription Providers</h2>
      <ul>
        {subscriptionProviders.map(provider => (
          <li key={provider.id}>{provider.name} - {provider.default_cost}</li>
        ))}
      </ul>

      <h2>Services</h2>
      <ul>
        {services.map(service => (
          <li key={service.id}>{service.name} - {service.cost}</li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Service Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Default Cost"
        value={defaultCost}
        onChange={(e) => setDefaultCost(e.target.value)}
      />
      <button onClick={handleAddService}>Add Service</button>
    </div>
  );
}

export default ServiceManagement;