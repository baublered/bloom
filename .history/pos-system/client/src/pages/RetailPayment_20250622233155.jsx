import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css';

const Stepper = ({ currentStep }) => (
    <div className="stepper">
      <div className="step complete"><div className="step-circle">✓</div><div className="step-label">Billing</div></div>
      <div className="step-line"></div>
      <div className={`step ${currentStep === 'payment' ? 'active' : ''}`}><div className="step-circle"></div><div className="step-label">Payment</div></div>
    </div>
);

function RetailPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Safely get data from the billing page
  const { orderSummary = [], grandTotal = 0, subtotal = 0, discountAmount = 0 } = location.state || {};

  // State management
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // Default to CASH
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Effect to calculate change for CASH payments
  useEffect(() => {
    if (paymentMethod === 'CASH') {
      const paid = parseFloat(amountPaid);
      if (!isNaN(paid) && paid >= grandTotal) {
        setChange(paid - grandTotal);
      } else {
        setChange(0);
      }
    } else {
      setAmountPaid(grandTotal > 0 ? grandTotal.toFixed(2) : '');
      setChange(0);
    }
  }, [amountPaid, grandTotal, paymentMethod]);

  // Effect to update the clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    setStatusMessage('');

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
      const response = await axios.post('/api/transactions/create', transactionData);

      if (response.data.success) {
        setStatusMessage('✅ Payment successful! Transaction recorded.');
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('totalAmount');
        setTimeout(() => navigate('/receipt', { state: { ...location.state, paymentMethod, amountPaid, change } }), 2000);
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

        <div className="payment-confirmation-box">
          <div className="confirmation-header">
            <button className="back-button-style" onClick={() => navigate(-1)}>‹</button>
            <h2>Payment Confirmation</h2>
          </div>
          <p className="invoice-id">Invoice ID: (Auto-generated)</p>

          <div className="payment-details">
            <div className="mode-of-payment">
              <h3>Mode of Payment</h3>
              <div className="payment-options-group">
                  <label>
                      <input type="radio" name="paymentMode" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} /> CASH
                  </label>
                  <label>
                      <input type="radio" name="paymentMode" value="GCASH" checked={paymentMethod === 'GCASH'} onChange={(e) => setPaymentMethod(e.target.value)} /> GCash
                  </label>
                  <label>
                      <input type="radio" name="paymentMode" value="BANK" checked={paymentMethod === 'BANK'} onChange={(e) => setPaymentMethod(e.target.value)} /> Bank Transfer
                  </label>
              </div>
            </div>
            <div className="date-time">
              <span>{currentDateTime.toLocaleDateString()}</span>
              <span>{currentDateTime.toLocaleTimeString()}</span>
            </div>
          </div>

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
            
            {paymentMethod === 'CASH' && (
              <>
                <div className="price-line amount-paid">
                  <span>Total amount paid:</span>
                  <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" />
                </div>
                <div className="price-line change"><span>Change:</span><span>₱{change.toFixed(2)}</span></div>
              </>
            )}
          </div>
          
          {statusMessage && <p className={`status-message-final ${statusMessage.includes('failed') || statusMessage.includes('Error') ? 'error' : 'success'}`}>{statusMessage}</p>}

          <button className="confirm-payment-button" onClick={handleConfirmPayment} disabled={isLoading || (paymentMethod === 'CASH' && (parseFloat(amountPaid) < grandTotal || !amountPaid))}>
            {isLoading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default RetailPayment;
