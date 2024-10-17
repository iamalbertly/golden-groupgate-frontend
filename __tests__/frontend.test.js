import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import App from '../src/App';
import Login from '../src/Login';
import AdminDashboard from '../src/AdminDashboard';

jest.mock('axios');

describe('Frontend Journey Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    axios.get.mockClear();
    axios.post.mockClear();
  });

  test('Complete User Journey', async () => {
    // 1. Render the App
    render(<Router><App /></Router>);

    // 2. Login
    axios.post.mockResolvedValueOnce({ data: { token: 'fake-token' } });
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/login', { username: 'admin', password: 'password' });
    });

    if (!localStorage.getItem('token')) {
      throw new Error('Login failed. Token not set in localStorage.');
    }

    // 3. Navigate to Dashboard
    axios.get.mockResolvedValueOnce({ data: [] }); // Mock customers
    axios.get.mockResolvedValueOnce({ data: [] }); // Mock subscriptions

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // 4. Add Customer
    axios.post.mockResolvedValueOnce({ data: { id: 1, full_name: 'Test Customer' } });
    
    fireEvent.click(screen.getByText('Add Customer'));
    fireEvent.change(screen.getByLabelText('Full Name:'), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number:'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByText('Add Customer'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/customers', {
        full_name: 'Test Customer',
        email: 'test@example.com',
        phone_number: '1234567890'
      });
    });

    // 5. Add Subscription
    axios.post.mockResolvedValueOnce({ data: { id: 1, service_name: 'TestAI' } });
    
    fireEvent.click(screen.getByText('Add New Subscription'));
    fireEvent.change(screen.getByLabelText('Service Name:'), { target: { value: 'TestAI' } });
    fireEvent.change(screen.getByLabelText('Cost (USD):'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Duration (Days):'), { target: { value: '30' } });
    fireEvent.click(screen.getByText('Add Subscription'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/subscriptions', {
        service_name: 'TestAI',
        cost_usd: '50',
        duration_days: '30'
      });
    });

    // 6. Generate Token
    axios.post.mockResolvedValueOnce({ data: { token: '12345678901234567890' } });
    
    fireEvent.click(screen.getByText('Generate Token'));
    fireEvent.change(screen.getByLabelText('Customer:'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Service:'), { target: { value: 'TestAI' } });
    fireEvent.change(screen.getByLabelText('Amount Paid (TZS):'), { target: { value: '1000' } });
    fireEvent.click(screen.getByText('Generate Token'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/generateToken', {
        customerId: '1',
        service: 'TestAI',
        amountPaid: '1000',
        hoursPurchased: expect.any(Number)
      });
    });

    // 7. Verify Token Generation
    await waitFor(() => {
      expect(screen.getByText('1234 5678 9012 3456 7890')).toBeInTheDocument();
    });

    if (!screen.getByText('1234 5678 9012 3456 7890')) {
      throw new Error('Token generation failed or token not displayed correctly.');
    }

    // 8. Decode Token
    axios.post.mockResolvedValueOnce({
      data: {
        userId: '1234',
        serviceId: '5678',
        customerName: 'Test Customer',
        serviceName: 'TestAI',
        hoursPurchased: 5,
        amountPaid: 1000,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
      }
    });

    fireEvent.change(screen.getByPlaceholderText('Enter 20-digit token (e.g., 1234 5678 9012 3456 7890)'), { target: { value: '12345678901234567890' } });
    fireEvent.click(screen.getByText('Decode Token'));

    await waitFor(() => {
      expect(screen.getByText('User Code: 1234')).toBeInTheDocument();
      expect(screen.getByText('Service Code: 5678')).toBeInTheDocument();
      expect(screen.getByText(/Expiration:/)).toBeInTheDocument();
      expect(screen.getByText('Hours Allocated: 5')).toBeInTheDocument();
    });

    // 8. Logout
    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    if (localStorage.getItem('token')) {
      throw new Error('Logout failed. Token still present in localStorage.');
    }
  });
});