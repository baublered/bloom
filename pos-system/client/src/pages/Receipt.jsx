import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import './Receipt.css';
import UserProfile from './UserProfile';

const Stepper = () => (
    <div className="stepper-container">
      <div className="step complete">
        <div className="step-icon">✓</div>
        <div className="step-label">Billing</div>
      </div>
      <div className="stepper-line"></div>
      <div className="step complete">
        <div className="step-icon">✓</div>
        <div className="step-label">Payment</div>
      </div>
    </div>
);


const Receipt = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUser(decodedToken.user);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    // Get the final order details from the payment page
    const { 
        orderSummary = [], 
        grandTotal = 0, 
        subtotal = 0, 
        discountAmount = 0,
        paymentMethod = 'CASH',
        change = 0,
        // Event-specific details
        isEventTransaction = false,
        isFinalPayment = false,
        amountPaidNow = 0,
        initialDownpayment = 0,
        finalRemainingBalance = 0,
        // Legacy props for retail
        amountPaid = 0,
        // Receipt details
        invoiceId,
        transactionId,
        eventId
    } = location.state || {};

    // Generate dynamic invoice ID if not provided
    const getInvoiceId = () => {
        if (invoiceId) return invoiceId;
        if (transactionId) return `TXN-${transactionId}`;
        if (eventId) return `EVT-${eventId}`;
        // Fallback: generate based on timestamp
        return `INV-${Date.now().toString().slice(-6)}`;
    };

    // Get cashier name from user token
    const getCashierName = () => {
        if (user?.name) return user.name;
        return 'Unknown Cashier';
    };
    
    // Fallback for direct navigation
    if (orderSummary.length === 0) {
        return (
            <div className="receipt-page">
                <p>No receipt data found. Please complete a transaction first.</p>
                <button onClick={() => {
                    if (user?.role === 'employee') {
                        navigate('/employee-dashboard');
                    } else {
                        navigate('/retail');
                    }
                }}>Go Back</button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };
    
    const handleDone = () => {
        // Navigate based on user role
        if (user?.role === 'employee') {
            navigate('/employee-dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="receipt-page">
             <header className="receipt-page-header">
                <h1>Receipt</h1>
                <div className="user-profile">
                        <UserProfile />
            </div>
            </header>
            <main className="receipt-main-content">
                <Stepper />
                <div className="receipt-area">
                    <div className="receipt-paper" id="printable-receipt">
                        <div className="receipt-header">
                            <h2>Flowers by Edmar</h2>
                            <p>Antipolo, City</p>
                        </div>
                        <div className="receipt-info">
                            <div className="info-left">
                                <p>Invoice ID: {getInvoiceId()}</p>
                                <p>Cashier Name: {getCashierName()}</p>
                            </div>
                            <div className="info-right">
                                <p>{new Date().toLocaleDateString()}</p>
                                <p>{new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className="receipt-orders">
                            <h3>Orders:</h3>
                            {orderSummary.map((item, index) => (
                                <div className="order-item" key={item._id || index}>
                                    <p className="item-name">{item.quantity || 1} pc. &nbsp;<strong>{item.productName || 'Unknown Item'}</strong></p>
                                    <p className="item-price">P{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="receipt-summary">
                             <div className="summary-line">
                                <span>Discounts:</span>
                                <span className="discount-text">- P{(discountAmount || 0).toFixed(2)}</span>
                            </div>
                            <div className="summary-line total">
                                <span>Total amount:</span>
                                <span>P{(grandTotal || 0).toFixed(2)}</span>
                            </div>
                            
                            {/* --- REVISED: Conditional Rendering for Event vs Retail --- */}
                            {isEventTransaction ? (
                                <div className="event-payment-summary">
                                    {isFinalPayment && initialDownpayment > 0 && (
                                        <div className="summary-line downpayment">
                                            <span>Initial Downpayment:</span>
                                            <span>P{initialDownpayment.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="summary-line">
                                        <span>{isFinalPayment ? 'Final Payment Made:' : (initialDownpayment > 0 ? 'Downpayment Paid:' : 'Amount Paid:')}</span>
                                        <span>P{(amountPaidNow || 0).toFixed(2)}</span>
                                    </div>
                                    {finalRemainingBalance > 0 && (
                                        <div className="summary-line remaining">
                                            <span>Remaining Balance:</span>
                                            <span>P{finalRemainingBalance.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="summary-line payment-method">
                                        <span>Payment Method:</span>
                                        <span>{paymentMethod}</span>
                                    </div>
                                    {paymentMethod === 'CASH' && (
                                        <div className="summary-line change">
                                            <span>Change:</span>
                                            <span>P{(change || 0).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="retail-payment-summary">
                                    <div className="summary-line">
                                        <span>Total amount paid:</span>
                                        <span>P{(parseFloat(amountPaid) || grandTotal).toFixed(2)}</span>
                                    </div>
                                    <div className="summary-line change">
                                        <span>Change:</span>
                                        <span>P{(change || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="receipt-actions">
                        <button className="print-button" onClick={handlePrint}>Print Receipt</button>
                        <button className="done-button" onClick={handleDone}>Done</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Receipt;
