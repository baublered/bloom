import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css'; // This can reuse the same CSS as the retail payment page

const Stepper = ({ currentStep }) => (
    <div className="stepper-container">
      <div className="step complete">
        <div className="step-icon">✓</div>
        <div className="step-label">Billing</div>
      </div>
      <div className="stepper-line"></div>
      <div className={`step ${currentStep === 'payment' ? 'active' : ''}`}>
        <div className="step-icon"></div>
        <div className="step-label">Payment</div>
      </div>
    </div>
);

const EventsPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { 
        orderSummary = [], 
        eventDetails = {}, 
        grandTotal = 0, 
        subtotal = 0, 
        discountAmount = 0 
    } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    // --- NEW: State for cash payments ---
    const [amountPaid, setAmountPaid] = useState('');
    const [change, setChange] = useState(0);

    // --- NEW: Effect to handle change calculation for cash ---
    useEffect(() => {
        if (paymentMethod === 'Cash') {
            const paid = parseFloat(amountPaid);
            if (!isNaN(paid) && paid >= grandTotal) {
                setChange(paid - grandTotal);
            } else {
                setChange(0);
            }
        } else {
            setAmountPaid('');
            setChange(0);
        }
    }, [amountPaid, grandTotal, paymentMethod]);


    const handleConfirmPayment = async () => {
        setIsLoading(true);
        setStatusMessage('');

        const transactionData = {
            transactionType: 'Events',
            items: orderSummary.map(item => ({
                productId: item._id,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal,
            discountAmount,
            totalAmount: grandTotal,
            paymentMethod,
            eventDetails,
        };

        try {
            const response = await axios.post('/api/transactions/create', transactionData);

            if (response.data.success) {
                setStatusMessage('✅ Payment successful! Event transaction recorded.');
                setTimeout(() => {
                    navigate('/receipt', { 
                        state: { 
                            orderSummary, 
                            eventDetails,
                            grandTotal, 
                            subtotal, 
                            discountAmount, 
                            paymentMethod,
                            amountPaid: paymentMethod === 'Cash' ? amountPaid : grandTotal,
                            change: change
                        }
                    });
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Failed to complete transaction.');
            }
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
            setStatusMessage(`❌ ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="payment-page-container">
            <header className="payment-header">
                {/* User profile can be added back here if needed */}
            </header>
            <div className="payment-layout">
                <Stepper currentStep="payment" />
                <main className="payment-content">
                    <div className="payment-left-panel">
                        <div className="confirmation-header">
                            <button className="back-button-style" onClick={() => navigate(-1)}>‹</button>
                            <h2>Payment Confirmation</h2>
                        </div>
                        <p className="invoice-id">Event For: {eventDetails.customerName || 'N/A'}</p>
                        
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            {orderSummary.map((item, index) => (
                                <div className="summary-item" key={index}>
                                    <span className="item-details">{item.quantity} pc(s) <strong>{item.productName}</strong></span>
                                    <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="price-breakdown">
                             <div className="price-line total"><span>Total amount to be paid:</span><span>₱{grandTotal.toFixed(2)}</span></div>
                        </div>

                        {/* --- NEW: Conditionally render cash details --- */}
                        {paymentMethod === 'Cash' && (
                            <div className="cash-payment-details">
                                <div className="price-line amount-paid">
                                    <span>Total amount paid:</span>
                                    <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="price-line change">
                                    <span>Change:</span>
                                    <span>₱{change.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="mode-of-payment">
                            <h3>Mode of Payment</h3>
                            <div className="payment-method-buttons">
                                <button className={`payment-method-btn ${paymentMethod === 'Cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('Cash')}>Cash</button>
                                <button className={`payment-method-btn ${paymentMethod === 'GCash' ? 'active' : ''}`} onClick={() => setPaymentMethod('GCash')}>GCash</button>
                                <button className={`payment-method-btn ${paymentMethod === 'Bank' ? 'active' : ''}`} onClick={() => setPaymentMethod('Bank')}>Bank Transfer</button>
                            </div>
                        </div>
                        
                        {statusMessage && <p className={`status-message-final ${statusMessage.includes('failed') || statusMessage.includes('Error') ? 'error' : 'success'}`}>{statusMessage}</p>}

                        <button 
                            className="confirm-payment-button" 
                            onClick={handleConfirmPayment} 
                            disabled={isLoading || !paymentMethod || (paymentMethod === 'Cash' && parseFloat(amountPaid) < grandTotal)}>
                            {isLoading ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </div>

                    <div className="payment-right-panel">
                        {!paymentMethod && <div className="payment-placeholder"><p>Please select a payment method to view details.</p></div>}
                        {paymentMethod === 'GCash' && <div className="payment-instructions"><h3>GCash Payment</h3><p>Scan QR to pay.</p><img src="https://placehold.co/250x250/0D6EFD/FFFFFF?text=GCash+QR" alt="GCash QR"/></div>}
                        {paymentMethod === 'Bank' && <div className="payment-instructions"><h3>Bank Transfer</h3><p>Scan QR to pay.</p><img src="https://placehold.co/250x250/28A745/FFFFFF?text=Bank+QR" alt="Bank QR"/></div>}
                        {paymentMethod === 'Cash' && <div className="payment-instructions"><h3>Cash Payment</h3><p>Please prepare the exact amount.</p></div>}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EventsPayment;
