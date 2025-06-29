// BillingRetail.jsx (Corrected)

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate, useParams } from 'react-router-dom';
import './BillingEvents.css'; // Your custom styles

// Helper components (UserProfileHeader, Stepper) remain the same.
const UserProfileHeader = () => (
    <header className="user-profile-header">
        <div className="user-profile-dropdown">
            <span className="user-icon">👤</span>
            <span>User Profile</span>
            <span className="dropdown-arrow">▼</span>
        </div>
    </header>
);

const Stepper = () => (
    <div className="stepper">
        <div className="stepper-item active">
            <div className="stepper-dot"></div>
            <div className="stepper-label">Billing</div>
        </div>
        <div className="stepper-line"></div>
        <div className="stepper-item">
            <div className="stepper-dot"></div>
            <div className="stepper-label">Payment</div>
        </div>
    </div>
);


function BillingEvents() {
    const navigate = useNavigate();
    const { orderId } = useParams(); // Get the orderId from the URL

    // State for holding the fetched data, loading status, and errors
    const [eventDetails, setEventDetails] = useState(null);
    const [selectedFlowers, setSelectedFlowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches data from the server when the component mounts.
     * This effect runs whenever the `orderId` from the URL changes.
     */
    useEffect(() => {
        // This function simulates fetching data from a backend API.
        const fetchOrderData = async (id) => {
            try {
                // Replace this mock data with an actual API call (e.g., fetch, axios)
                // Example: const response = await fetch(`/api/orders/${id}`);
                // if (!response.ok) throw new Error('Network response was not ok');
                // const data = await response.json();

                // --- MOCK DATA FOR DEMONSTRATION ---
                const mockData = {
                    eventDetails: {
                        customerName: 'Alex Reyes',
                        date: new Date().toISOString(),
                        address: '123 Sampaguita St., Manila',
                        phone: '0917-000-1111',
                        notes: 'Deliver to the front desk and ask for Alex.',
                    },
                    selectedFlowers: [
                        { name: 'Sunflower Arrangement', quantity: 2, totalPrice: 3000.00 },
                        { name: 'Tulip Bouquet', quantity: 1, totalPrice: 1800.00 },
                    ],
                };
                // --- END MOCK DATA ---

                setEventDetails(mockData.eventDetails);
                setSelectedFlowers(mockData.selectedFlowers);

            } catch (err) {
                setError('Failed to fetch order details. Please try again.');
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderData(orderId);
        } else {
            setError('No Order ID was found in the URL.');
            setLoading(false);
        }
    }, [orderId]); // Dependency array ensures this runs if the orderId changes

    // --- RENDER STATES ---

    // 1. Loading State
    if (loading) {
        return <div className="billing-page"><p>Loading order...</p></div>;
    }

    // 2. Error State
    if (error) {
        return (
            <div className="billing-page">
                <p>Error: {error}</p>
                <button onClick={() => navigate('/transactions/events')}>Return to Events</button>
            </div>
        );
    }
    
    // 3. Data Missing State (after fetch attempt)
    if (!eventDetails || !selectedFlowers) {
        return (
            <div className="billing-page">
                <p>Could not load order data.</p>
                <button onClick={() => navigate('/transactions/events')}>Return to Events</button>
            </div>
        );
    }

    // --- DATA & CALCULATIONS ---
    const subtotal = selectedFlowers.reduce((acc, flower) => acc + flower.totalPrice, 0);
    const discountAmount = 10.00;
    const totalAmount = subtotal - discountAmount;
    const formatCurrency = (amount) => `₱${amount.toFixed(2)}`;

    // 4. Success State (Render the component with data)
    return (
        <div className="billing-page">
            <div className="billing-container">
                <UserProfileHeader />
                <h2 className="billing-title">Billing for Events</h2>

                <div className="content-wrapper">
                    <Stepper />
                    <main className="main-content">
                        {/* Order Details Panel */}
                        <section className="order-details">
                            <h3>Order Details</h3>
                            <p className="invoice-id">Invoice ID: {orderId}</p>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Customer Name:</label>
                                    <div className="detail-value">{eventDetails.customerName}</div>
                                </div>
                                <div className="detail-item date-container">
                                    <label>Date:</label>
                                    <div className="detail-value">{new Date(eventDetails.date).toLocaleDateString()}</div>
                                    <Calendar value={new Date(eventDetails.date)} className="mini-calendar" view="month" />
                                </div>
                                <div className="detail-item full-width">
                                    <label>Event Address:</label>
                                    <div className="detail-value">{eventDetails.address}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Phone Number:</label>
                                    <div className="detail-value">{eventDetails.phone}</div>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Products/Bundles Ordered:</label>
                                    <div className="detail-value">Wedding Bundle</div>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Remarks:</label>
                                    <div className="detail-value">{eventDetails.notes}</div>
                                </div>
                            </div>
                        </section>

                        {/* Order Summary Panel */}
                        <aside className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-items">
                                <div className="summary-header">
                                    <span>QTY.</span>
                                    <span>Ordered Products</span>
                                    <span className="align-right">Price</span>
                                </div>
                                {selectedFlowers.map(item => (
                                    <div className="summary-item" key={item.name}>
                                        <span>{item.quantity}</span>
                                        <div>
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-remark">Remark: {eventDetails.notes}</p>
                                        </div>
                                        <span className="align-right">{formatCurrency(item.totalPrice)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="summary-totals">
                                <div className="total-row">
                                    <span>Price:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="total-row discount">
                                    <span>Discounts:</span>
                                    <div>
                                        <span className="discount-code">123SALE</span>
                                        <span className="original-price">{formatCurrency(discountAmount + 100)}</span>
                                        <span>{formatCurrency(-discountAmount)}</span>
                                    </div>
                                </div>
                                <hr />
                                <div className="total-row grand-total">
                                    <span>Total Amount:</span>
                                    <span>{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>

                            <button className="proceed-button" onClick={() => navigate('/payment')}>
                                Save & Proceed to Payment
                            </button>
                        </aside>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default BillingEvents;