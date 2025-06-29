import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css'; // Both payment pages can share this CSS

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

function EventsPayment() {
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
  const [downPayment, setDownPayment] = useState(eventDetails.downPayment || '');
  const [remainingBalance, setRemainingBalance] = useState(grandTotal);
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Calculate remaining balance whenever the down payment changes
  useEffect(() => {
    const dp = parseFloat(downPayment);
    if (!isNaN(dp) && dp >= 0) {
      setRemainingBalance(grandTotal - dp);
    } else {
      setRemainingBalance(grandTotal);
    }
  }, [downPayment, grandTotal]);
  
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

    // Prepare data for updating the event
    const eventUpdateData = {
        products: orderSummary.map(item => ({
            productId: item._id,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
        })),
        subtotal,
        discountAmount,
        downPayment: parseFloat(downPayment) || 0,
    };

    try {
      // In a real app, you would handle file uploads with FormData
      console.log("Proof of Payment File:", proofOfPayment);

      // --- CORRECT API CALL for Events ---
      // This sends a PUT request to update the existing event record
      const response = await axios.put(`/api/events/update/${eventDetails._id}`, eventUpdateData);

      if (response.data.success) {
        setStatusMessage('✅ Event payment details saved successfully!');
        // Navigate back to the calendar to see the updated status color
        setTimeout(() => navigate('/events'), 2000);
      } else {
        throw new Error(response.data.message || 'Failed to update event.');
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save event details.';
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
                         <div className="price-line"><span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span></div>
                         <div className="price-line"><span className="discount-text">Discounts:</span><span className="discount-text">- ₱{discountAmount.toFixed(2)}</span></div>
                         <div className="price-line total"><span>Total Event Cost:</span><span>₱{grandTotal.toFixed(2)}</span></div>
                    </div>
                    
                    {/* Down Payment section */}
                    <div className="cash-payment-details">
                         <div className="price-line amount-paid">
                            <span>Down Payment:</span>
                            <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="price-line change">
                            <span>Remaining Balance:</span>
                            <span>₱{remainingBalance.toFixed(2)}</span>
                        </div>
                    </div>

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
                        disabled={isLoading || !paymentMethod}>
                        {isLoading ? 'Saving...' : 'Save Payment Details'}
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
                        </div>
                    )}
                     {paymentMethod === 'CASH' && (
                        <div className="payment-instructions">
                           <h4>Cash Payment</h4>
                           <p>Please enter the down payment amount on the left.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}

export default EventsPayment;
