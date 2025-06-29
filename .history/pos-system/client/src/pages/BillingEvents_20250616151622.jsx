// BillingEvents.jsx

import { useState } from 'react';
import Calendar from 'react-calendar'; // This line is important
import 'react-calendar/Calendar.css'; // REMOVED '/dist' from the path
import { useNavigate } from 'react-router-dom';
import './BillingEvents.css';

// ... the rest of your component code remains exactly the same ...

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

    // Use state to manage form data
    const [customerName, setCustomerName] = useState('Alexine Maloping');
    const [eventDate, setEventDate] = useState(new Date('2024-10-26'));
    const [eventAddress, setEventAddress] = useState('123 Maple Street Apartment 4B Springfield, Antipolo, City.');
    const [phoneNumber, setPhoneNumber] = useState('09216854474');
    const [productsOrdered, setProductsOrdered] = useState('Wedding bundles');
    const [remarks, setRemarks] = useState('Yellow-themed wedding');

    const orderSummary = {
        items: [
            { qty: 1, name: 'Wedding Bundle', remark: `Remark: ${remarks}`, price: 11500.00 }
        ],
        price: 115.00,
        discountCode: '123SALE',
        discountAmount: 10.00,
        totalAmount: 105.00,
    };

    const formatCurrency = (amount) => `P${amount.toFixed(2)}`;

    return (
        <div className="billing-page-container">
            <UserProfileHeader />
            <div className="billing-content-layout">
                <Stepper />
                <main className="billing-form-panel">
                    <div className="panel-header">
                        <h1>Billing</h1>
                    </div>

                    <section className="order-details-panel">
                        <header className="order-details-header">
                            <h2>Order Details</h2>
                            <p>Invoice ID 001</p>
                        </header>
                        <div className="details-form-grid">
                            {/* Customer Name */}
                            <div className="form-group">
                                <label htmlFor="customerName">Customer Name:</label>
                                <input
                                    type="text"
                                    id="customerName"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>

                            {/* Date Field - This is now just a label for the calendar */}
                            <div className="form-group">
                                <label>Date:</label>
                                {/* The calendar itself will be the input */}
                            </div>

                            {/* Event Address */}
                            <div className="form-group full-width">
                                <label htmlFor="eventAddress">Events Address:</label>
                                <input
                                    type="text"
                                    id="eventAddress"
                                    value={eventAddress}
                                    onChange={(e) => setEventAddress(e.target.value)}
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone number:</label>
                                <input
                                    type="text" // Use text to allow leading zeros, pattern for numbers
                                    id="phoneNumber"
                                    pattern="[0-9]*"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} // Allow only digits
                                />
                            </div>

                             {/* This is a spacer to align the calendar correctly */}
                             <div className="form-group calendar-container">
                                <Calendar
                                    onChange={setEventDate}
                                    value={eventDate}
                                    tileClassName={({ date, view }) => view === 'month' && date.getDate() === 25 ? 'highlight' : null}
                                />
                            </div>


                            {/* Products Ordered */}
                            <div className="form-group">
                                <label htmlFor="productsOrdered">Products/Bundles Ordered</label>
                                <input
                                    type="text"
                                    id="productsOrdered"
                                    value={productsOrdered}
                                    onChange={(e) => setProductsOrdered(e.target.value)}
                                />
                            </div>

                             {/* Remarks */}
                             <div className="form-group full-width">
                                <label htmlFor="remarks">Remarks:</label>
                                <input
                                    type="text"
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>
                </main>

                <aside className="order-summary-panel">
                    <h3>Order Summary</h3>
                    <div className="summary-items-container">
                        <div className="summary-table-header">
                            <span>QTY.</span>
                            <span>Ordered Products</span>
                            <span className="text-right">Price</span>
                        </div>
                        {orderSummary.items.map((item, index) => (
                            <div className="summary-item-row" key={index}>
                                <span>{item.qty}</span>
                                <div>
                                    <p className="item-name">{item.name}</p>
                                    <p className="item-remark">{item.remark}</p>
                                </div>
                                <span className="text-right">
                                    {formatCurrency(item.price)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-totals-section">
                        <div className="summary-total-row">
                            <span>Price:</span>
                            <span>{formatCurrency(orderSummary.price)}</span>
                        </div>
                        <div className="summary-total-row">
                            <span>Discounts:</span>
                            <div className="discount-details text-right">
                                <span className="discount-code">{orderSummary.discountCode}</span>
                                <span>-{formatCurrency(orderSummary.discountAmount)}</span>
                            </div>
                        </div>
                        <div className="summary-total-row grand-total">
                            <span>Total Amount:</span>
                            <span>{formatCurrency(orderSummary.totalAmount)}</span>
                        </div>
                    </div>
                    <button className="proceed-button" onClick={() => navigate('/payment')}>
                        Save & Proceed to Payment
                    </button>
                </aside>
            </div>
        </div>
    );
}

export default BillingEvents;