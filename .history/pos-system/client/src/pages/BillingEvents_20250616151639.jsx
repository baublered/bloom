// BillingEvents.jsx

// import Calendar from 'react-calendar'; // Keep this commented out if you are not using it yet
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import './BillingRetail.css'; // Ensure this CSS file is in the same directory

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
            <div className="stepper-dot-container">
                <div className="stepper-dot"></div>
            </div>
            <div className="stepper-label">Billing</div>
        </div>
        <div className="stepper-line"></div>
        <div className="stepper-item">
            <div className="stepper-dot-container">
                <div className="stepper-dot"></div>
            </div>
            <div className="stepper-label">Payment</div>
        </div>
    </div>
);

function BillingEvents() {
    const navigate = useNavigate();

    const eventDetails = {
        customerName: 'Alexine Maloping',
        date: new Date('2024-10-26T00:00:00'),
        address: '123 Maple Street Apartment 4B Springfield, Antipolo, City.',
        phone: '09216854474',
        remarks: 'Yellow-themed wedding',
        productsOrdered: 'Wedding bundles',
    };

    const orderSummary = {
        items: [
            { qty: 1, name: 'Wedding Bundle', remark: 'Remark: Yellow-themed wedding', price: 11500.00 }
        ],
        subtotal: 115.00,
        discountCode: '123SALE',
        discountAmount: 10.00,
        totalAmount: 105.00,
    };

    // In your inspiration image, the prices are P115.00, P10.00, and P105.00,
    // which seems to be a typo. I'll use the correct calculation based on your original data.
    const calculatedTotal = orderSummary.items.reduce((acc, item) => acc + item.price, 0) - orderSummary.discountAmount;


    const formatCurrency = (amount) => `P${amount.toFixed(2)}`;

    return (
        <div className="billing-events-page">
            <UserProfileHeader />
            <div className="billing-events-container">
                <Stepper />
                <div className="billing-events-content">
                    <main className="order-details-card">
                        <header className="order-details-header">
                            <h2>Order Details</h2>
                            <p>Invoice ID 001</p>
                        </header>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Customer Name:</label>
                                <div className="detail-value">{eventDetails.customerName}</div>
                            </div>
                            <div className="detail-item">
                                <label>Date:</label>
                                <div className="detail-value calendar-value">
                                    {eventDetails.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    <span className="calendar-icon">📅</span>
                                </div>
                            </div>
                            <div className="detail-item full-width">
                                <label>Events Address:</label>
                                <div className="detail-value">{eventDetails.address}</div>
                            </div>
                            <div className="detail-item">
                                <label>Phone number:</label>
                                <div className="detail-value">{eventDetails.phone}</div>
                            </div>
                            <div className="detail-item">
                                <label>Products/Bundles Ordered:</label>
                                <div className="detail-value">{eventDetails.productsOrdered}</div>
                            </div>
                            <div className="detail-item full-width">
                                <label>Remarks:</label>
                                <div className="detail-value">{eventDetails.remarks}</div>
                            </div>
                        </div>
                    </main>
                    <aside className="order-summary-card">
                        <h3>Order Summary</h3>
                        <div className="summary-items">
                            <div className="summary-header">
                                <span>QTY.</span>
                                <span>Ordered Products</span>
                                <span className="align-right">Price</span>
                            </div>
                            {orderSummary.items.map((item, index) => (
                                <div className="summary-item" key={index}>
                                    <span>{item.qty}</span>
                                    <div>
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-remark">{item.remark}</p>
                                    </div>
                                    <span className="align-right">{formatCurrency(item.price)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-totals">
                            <div className="total-row">
                                <span>Price:</span>
                                <span>{formatCurrency(orderSummary.items.reduce((acc, item) => acc + item.price, 0))}</span>
                            </div>
                            <div className="total-row">
                                <span>Discounts:</span>
                                <div className="discount-details">
                                    <span className="discount-code">{orderSummary.discountCode}</span>
                                    <span className="discount-amount">-{formatCurrency(orderSummary.discountAmount)}</span>
                                 </div>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total Amount:</span>
                                <span>{formatCurrency(calculatedTotal)}</span>
                            </div>
                        </div>
                        <button className="proceed-button" onClick={() => navigate('/payment')}>
                            Save & Proceed to Payment
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default BillingEvents;