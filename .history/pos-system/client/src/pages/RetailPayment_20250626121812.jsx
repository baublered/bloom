import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css';
import UserProfile from './UserProfile';

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
  const [proofOfPayment, setProofOfPayment] = useState(null);
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

  const handleFileChange = (e) => {
    setProofOfPayment(e.target.files[0]);
  };

  const handleConfirmPayment = async () => {
    if ((paymentMethod === 'GCASH' || paymentMethod === 'BANK') && !proofOfPayment) {
        setStatusMessage('❌ Please upload proof of payment.');
        return;
    }

    setIsLoading(true);
    setStatusMessage('');

    // Prepare the data for the new transaction
    const transactionData = {
        transactionType: 'Retail',
        items: orderSummary.map(item => ({
            productId: item._id, // Ensure productId is sent for backend logic
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            isBouquet: item.isBouquet,
            components: item.components
        })),
        subtotal,
        discountAmount,
        totalAmount: grandTotal,
        paymentMethod,
    };

    try {
      // --- CORRECTED API CALL ---
      // This now calls the unified endpoint to create a transaction and update stock
      const response = await axios.post('/api/transactions/create', transactionData);
      
      if (response.data.success) {
        setStatusMessage('✅ Payment successful! Transaction recorded.');
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('totalAmount');
        setTimeout(() => navigate('/receipt', { 
            state: { 
                ...location.state, 
                paymentMethod, 
                amountPaid: paymentMethod === 'CASH' ? amountPaid : grandTotal, 
                change: change,
                proofOfPayment: proofOfPayment?.name 
            } 
        }), 2000);
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
            <div className="user-profile">
              <UserProfile />
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
                            <button className={`payment-method-btn ${paymentMethod === 'CASH' ? 'active' : ''}`} onClick={() => setPaymentMethod('CASH')}>Cash</button>
                            <button className={`payment-method-btn ${paymentMethod === 'GCASH' ? 'active' : ''}`} onClick={() => setPaymentMethod('GCASH')}>GCash</button>
                            <button className={`payment-method-btn ${paymentMethod === 'BANK' ? 'active' : ''}`} onClick={() => setPaymentMethod('BANK')}>Bank Transfer</button>
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
                        <div className="payment-placeholder"><p>Please select a payment method.</p></div>
                    )}
                    {(paymentMethod === 'GCASH' || paymentMethod === 'BANK') && (
                        <div className="payment-instructions">
                            <h4>Upload Proof of Payment</h4>
                            <p>Please upload a screenshot of your transaction confirmation.</p>
                            
                            <div className="file-upload-container">
                                <label htmlFor="file-upload" className="file-upload-label">
                                    {proofOfPayment ? `Selected: ${proofOfPayment.name}` : 'Choose File'}
                                </label>
                                <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" />
                            </div>

                            {paymentMethod === 'GCASH' && (
                                <div className="account-info">
                                    <p><strong>GCash Name:</strong> BloomTrack Inc.</p>
                                    <p><strong>GCash Number:</strong> 0917-123-4567</p>
                                </div>
                            )}
                             {paymentMethod === 'BANK' && (
                                <div className="account-info">
                                    <p><strong>Bank:</strong> BDO Unibank</p>
                                    <p><strong>Account Name:</strong> BloomTrack Inc.</p>
                                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                                </div>
                            )}
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
