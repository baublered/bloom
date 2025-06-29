import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import './BillingRetail.css'; // Ensure this import path is correct

// User Profile Header Component
const UserProfileHeader = () => (
    <header className="user-profile-header">
        <div className="user-profile-dropdown">
            <span className="user-icon">👤</span>
            <span>User Profile</span>
        </div>
    </header>
);

// Stepper Component
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

    // Mock data to perfectly match your design
    const eventDetails = {
        customerName: 'Alexine Maloping',
        date: new Date('2024-10-26T00:00:00'), // Use a specific date
        address: '123 Maple Street Apartment 4B Springfield, Antipolo, City.',
        phone: '09216854474',
        remarks: 'Yellow-themed wedding',
        productsOrdered: 'Wedding bundles',
    };

    const orderSummary = {
        items: [
            { qty: 1, name: 'Wedding Bundle', remark: 'Remark: Yellow-themed wedding', price: 11500.00 }
        ],
        subtotal: 11500.00,
        discountCode: '123SALE',
        discountAmount: 10.00,
        totalAmount: 11490.00,
    };

    const formatCurrency = (amount) => `P${amount.toFixed(2)}`;

    return (
        <div className="billing-page">
            <div className="billing-container">
                <UserProfileHeader />
                <h2 className="billing-title">Billing for events</h2>

                <div className="content-wrapper">
                    <Stepper />

                    <main className="main-content">
                        {/* Left Panel: Order Details */}
                        <section className="order-details">
                            <h3>Order Details</h3>
                            <p className="invoice-id">Invoice ID 001</p>

                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Customer Name:</label>
                                    <div className="detail-value">{eventDetails.customerName}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Date:</label>
                                    <div className="detail-value">{eventDetails.date.toLocaleDateString('en-US')}</div>
                                </div>
                                <div className="detail-item full-width calendar-container">
                                     <Calendar
                                        value={eventDetails.date}
                                        className="mini-calendar"
                                        view="month"
                                    />
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
                        </section>

                        {/* Right Panel: Order Summary */}
                        <aside className="order-summary">
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
                                    <span>{formatCurrency(orderSummary.subtotal)}</span>
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
                                    <span>{formatCurrency(orderSummary.totalAmount)}</span>
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