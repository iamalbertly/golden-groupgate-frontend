import React, { useState, useEffect } from 'react';
import { FaUsers, FaClipboardList, FaMoneyBillWave, FaEnvelope, FaPhone } from 'react-icons/fa';
import AddCustomerModal from './AddCustomerModal';
import GenerateTokenModal from './GenerateTokenModal';
import SubscriptionModal from './SubscriptionModal';
import './AdminDashboard.css';
import api from './api';

function Dashboard() {
    const [customers, setCustomers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedService, setSelectedService] = useState('OpenAI');
    const [groupSize, setGroupSize] = useState(1);
    const [hoursToPurchase, setHoursToPurchase] = useState(1);
    const [pricePerToken, setPricePerToken] = useState(0);
    const [error, setError] = useState(null);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [isGenerateTokenModalOpen, setIsGenerateTokenModalOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [view, setView] = useState('overview');
    const services = ['OpenAI', 'Claude'];
    const [selectedCustomerServices, setSelectedCustomerServices] = useState([]);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [hasSubscriptions, setHasSubscriptions] = useState(true);
    const [showSubscriptionNotification, setShowSubscriptionNotification] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchCustomers();
        fetchSubscriptions();
        checkSubscriptions();
    }, [selectedService]);

    const fetchCustomers = () => {
        api.get('/customerRemainingTime')
            .then(response => {
                setCustomers(response.data);
            })
            .catch(error => {
                console.error('Error fetching customers:', error);
                setError(`Error fetching customers: ${error.message}`);
            });
    };

    const fetchSubscriptions = () => {
        api.get(`/subscriptions?service=${selectedService}`)
            .then(response => {
                setSubscriptions(response.data);
            })
            .catch(error => {
                console.error('Error fetching subscriptions:', error);
                setError(`Error fetching subscriptions: ${error.response?.data?.error || error.message}`);
                setSubscriptions([]); // Set to empty array in case of error
            });
    };

    const calculatePrice = () => {
        if (subscriptions.length === 0) return;

        const totalCost = subscriptions.reduce((acc, sub) => acc + sub.subscription_cost_tzs, 0);
        const totalHours = subscriptions.reduce((acc, sub) => {
            const remainingTime = new Date(sub.expiration_date) - new Date();
            return acc + Math.floor(remainingTime / (1000 * 60 * 60)); // Convert ms to hours
        }, 0);

        const pricePerHour = totalCost / groupSize / totalHours;
        setPricePerToken(pricePerHour * hoursToPurchase);
    };

    useEffect(() => {
        calculatePrice();
    }, [groupSize, hoursToPurchase, subscriptions]);

    const handleOpenAddCustomerModal = () => {
        setIsAddCustomerModalOpen(true);
    };

    const handleCloseAddCustomerModal = () => {
        setIsAddCustomerModalOpen(false);
    };

    const handleOpenGenerateTokenModal = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        const customerServices = customer.services ? customer.services.split(',') : [];
        console.log('Available services:', customerServices); // Add this line for debugging
        setSelectedCustomerServices(customerServices);
        setSelectedCustomerId(customerId);
        setSelectedCustomerDetails(customer);
        setIsGenerateTokenModalOpen(true);
    };

    const handleCloseGenerateTokenModal = () => {
        setIsGenerateTokenModalOpen(false);
    };

    const handleDeleteCustomer = (customerId) => {
        api.delete(`/deleteCustomer/${customerId}`)
            .then(response => {
                alert(response.data.message);
                fetchCustomers(); // Refresh the customer list
            })
            .catch(error => {
                console.error('Error deleting customer:', error);
                alert(`Error deleting customer: ${error.response?.data?.error || error.message}, Details: ${error.response?.data?.details || 'No additional details'}`);
            });
    };

    const checkSubscriptions = async () => {
        try {
            const response = await api.get('/checkSubscriptions');
            setHasSubscriptions(response.data.hasSubscriptions);
            if (!response.data.hasSubscriptions) {
                setIsSubscriptionModalOpen(true);
            }
        } catch (error) {
            console.error('Error checking subscriptions:', error);
        }
    };

    const handleCloseSubscriptionModal = () => {
        setIsSubscriptionModalOpen(false);
        if (!hasSubscriptions) {
            setShowSubscriptionNotification(true);
        }
    };

    const handleSubscriptionAdded = () => {
        setHasSubscriptions(true);
        setShowSubscriptionNotification(false);
        // Refresh other data as needed
        fetchSubscriptions();
    };

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="admin-dashboard">
            <nav>
                <button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}>Dashboard</button>
                <button className={view === 'tokenGeneration' ? 'active' : ''} onClick={() => setView('tokenGeneration')}>Generate Token</button>
                <button className={view === 'customerManagement' ? 'active' : ''} onClick={() => setView('customerManagement')}>Manage Customers</button>
                <button className={view === 'subscriptionManagement' ? 'active' : ''} onClick={() => setView('subscriptionManagement')}>Manage Subscriptions</button>
                <div className="user-management">
                    <span>Administrator</span>
                    <button onClick={() => { localStorage.removeItem('userId'); window.location.reload(); }}>Logout</button>
                    <i className="user-icon">👤</i>
                </div>
            </nav>
            <div className="dashboard-container">
                <div className="current-time">
                    {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString('en-GB')}
                </div>
                <div className="service-selection">
                    <label htmlFor="service">Select AI Service:</label>
                    <select id="service"
                        onChange={(e) => setSelectedService(e.target.value)}  >
                        {services.map((service) => (
                            <option key={service} value={service}>
                                {service}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="status-section">
                    <div className="customer-overview" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginTop: '20px', width: '100%' }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>Customers ({customers.length})</h3>
                            <button onClick={handleOpenAddCustomerModal}>Add Customer</button>
                        </span>
                        <div className="customer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                            {customers.map((customer) => (
                                <div key={customer.id} className="customer-item" style={{
                                    backgroundColor: customer.remaining_seconds > 0 ? '#e0ffe0' : '#ffe0e0',
                                    height: '200px',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        padding: '2px 5px',
                                        borderRadius: '3px',
                                        fontSize: '0.8em',
                                        fontWeight: 'bold',
                                        border: '1px solid #ccc'
                                    }}>
                                        {customer.service || 'No Subscription'}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{customer.name}</p>
                                        <p><FaEnvelope /> {customer.email}</p>
                                        <p><FaPhone /> {customer.phone_number}</p>
                                        <p>Remaining Hours: {Math.floor(customer.remaining_seconds / 3600)}</p>
                                    </div>
                                    <div>
                                        <button onClick={() => handleOpenGenerateTokenModal(customer.id)}>Add Hours</button>
                                        <button onClick={() => handleDeleteCustomer(customer.id)} disabled={customer.remaining_seconds > 0}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid-container">
                    <div className="card">
                        <h2><FaMoneyBillWave /> Price per Hourly Token</h2>
                        <div>
                            <label>Group Size:</label>
                            <input type="number" value={groupSize} onChange={(e) => setGroupSize(e.target.value)} min="1" />
                        </div>
                        <div>
                            <label>Hours to Purchase:</label>
                            <input type="number" value={hoursToPurchase} onChange={(e) => setHoursToPurchase(e.target.value)} min="1" />
                        </div>
                        <h3>Price per Hourly Token: {pricePerToken.toFixed(2)} TZS</h3>
                    </div>
                </div>
            </div>
            <AddCustomerModal
                isOpen={isAddCustomerModalOpen}
                onClose={handleCloseAddCustomerModal}
                onCustomerAdded={fetchCustomers}
            />
            <GenerateTokenModal
                isOpen={isGenerateTokenModalOpen}
                onClose={handleCloseGenerateTokenModal}
                onTokenGenerated={fetchCustomers}
                customerId={selectedCustomerId}
                availableServices={selectedCustomerServices}
                customerDetails={selectedCustomerDetails}
            />
            {showSubscriptionNotification && (
                <div className="subscription-notification">
                    <p>No subscription services added. GroupGate requires at least one subscription to function properly.</p>
                    <button onClick={() => setIsSubscriptionModalOpen(true)}>Add Subscription</button>
                </div>
            )}
            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={handleCloseSubscriptionModal}
                onSubscriptionAdded={handleSubscriptionAdded}
            />
        </div>
    );
}

export default Dashboard;