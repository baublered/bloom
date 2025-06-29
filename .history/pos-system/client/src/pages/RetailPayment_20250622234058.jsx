import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css';

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

function RetailPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  const { orderSummary = [], grandTotal = 0, subtotal = 0, discountAmount = 0 } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (paymentMethod === 'CASH') {
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    setStatusMessage('');

    // Prepare the data for the new transaction
    const transactionData = {
        transactionType: 'Retail',
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
    };

    try {
      // --- CORRECTED API CALL ---
      // This now calls your new endpoint to create a transaction,
      // which also handles updating the stock.
      const response = await axios.post('/api/transactions/create', transactionData);

      if (response.data.success) {
        setStatusMessage('✅ Payment successful! Transaction recorded.');
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('totalAmount');
        setTimeout(() => {
          navigate('/receipt', { 
            state: { 
                orderSummary, 
                grandTotal, 
                subtotal, 
                discountAmount, 
                paymentMethod,
                amountPaid: paymentMethod === 'CASH' ? amountPaid : grandTotal,
                change,
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
            <h1>Payment</h1>
            <div className="user-profile-mock">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>User Profile</span>
            </div>
        </header>
        <main className="payment-main-content">
            <Stepper currentStep="payment" />
            <div className="payment-two-panel-layout">
                {/* Left Panel */}
                <div className="payment-left-panel">
                    <div className="confirmation-header">
                        <button className="back-button-style" onClick={() => navigate(-1)}>‹</button>
                        <h2>Payment Confirmation</h2>
                    </div>
                    <p className="invoice-id">Invoice ID: (Auto-generated)</p>
                    
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
                         <div className="price-line"><span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span></div>
                         <div className="price-line"><span className="discount-text">Discounts:</span><span className="discount-text">- ₱{discountAmount.toFixed(2)}</span></div>
                         <div className="price-line total"><span>Total amount to be paid:</span><span>₱{grandTotal.toFixed(2)}</span></div>
                    </div>
                    
                    {paymentMethod === 'CASH' && (
                        <div className="cash-payment-details">
                             <div className="price-line amount-paid">
                                <span>Total amount paid:</span>
                                <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="price-line change"><span>Change:</span><span>₱{change.toFixed(2)}</span></div>
                        </div>
                    )}

                    <div className="mode-of-payment">
                        <h3>Mode of Payment</h3>
                        <div className="payment-method-buttons">
                            <button 
                                className={`payment-method-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('CASH')}>
                                Cash
                            </button>
                            <button 
                                className={`payment-method-btn ${paymentMethod === 'GCASH' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('GCASH')}>
                                GCash
                            </button>
                            <button 
                                className={`payment-method-btn ${paymentMethod === 'BANK' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('BANK')}>
                                Bank Transfer
                            </button>
                        </div>
                    </div>
                    
                    {statusMessage && <p className={`status-message-final ${statusMessage.includes('failed') || statusMessage.includes('Error') ? 'error' : 'success'}`}>{statusMessage}</p>}

                    <button 
                        className="confirm-payment-button" 
                        onClick={handleConfirmPayment}
                        disabled={isLoading || !paymentMethod || (paymentMethod === 'CASH' && (parseFloat(amountPaid) < grandTotal || !amountPaid))}>
                        {isLoading ? 'Processing...' : 'Confirm Payment'}
                    </button>
                </div>

                {/* Right Panel */}
                <div className="payment-right-panel">
                    {!paymentMethod && (
                        <div className="payment-placeholder">
                            <p>Please select a payment method to view details.</p>
                        </div>
                    )}
                    {paymentMethod === 'GCASH' && (
                        <div className="payment-instructions">
                            <p>Scan the QR Code to pay with GCash</p>
                            <img src="https://placehold.co/250x250/0D6EFD/FFFFFF?text=GCash+QR" alt="GCash QR Code" />
                            <h4>Account Details</h4>
                            <p><strong>Account Name:</strong> BloomTrack Inc.</p>
                            <p><strong>Account Number:</strong> 0917-123-4567</p>
                        </div>
                    )}
                    {paymentMethod === 'BANK' && (
                        <div className="payment-instructions">
                            <p>Scan the QR Code for bank transfer</p>
                            <img src="https://placehold.co/250x250/28A745/FFFFFF?text=Bank+QR" alt="Bank Transfer QR Code" />
                            <h4>Account Details</h4>
                            <p><strong>Bank:</strong> BDO Unibank</p>
                            <p><strong>Account Name:</strong> BloomTrack Inc.</p>
                            <p><strong>Account Number:</strong> 1234-5678-9012</p>
                        </div>
                    )}
                     {paymentMethod === 'CASH' && (
                        <div className="payment-instructions">
                           <h4>Cash Payment</h4>
                           <p>Please prepare the exact amount or higher to receive change.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}

export default RetailPayment;
