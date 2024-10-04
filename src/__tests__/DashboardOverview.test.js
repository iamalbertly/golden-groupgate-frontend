import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardOverview from '../DashboardOverview';

test('renders DashboardOverview component', () => {
  render(<DashboardOverview />);
  const titleElement = screen.getByText(/Dashboard Overview/i);
  expect(titleElement).toBeInTheDocument();
});