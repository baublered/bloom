import axios from 'axios'; // Import axios to make the API call
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css';

function RetailPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- Data Fetching from Billing Page ---
  const { orderSummary = [], grandTotal = 0, subtotal = 0, discountAmount = 0 } = location.state || {};

  // --- State Management ---
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH', 'GCASH', or 'BANK'
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // --- Effects for Calculations ---
  useEffect(() => {
    // Only calculate change for CASH payments
    if (paymentMethod === 'CASH') {
      const paid = parseFloat(amountPaid);
      if (!isNaN(paid) && paid >= grandTotal) {
        setChange(paid - grandTotal);
      } else {
        setChange(0);
      }
    } else {
      // For GCash or Bank, amount paid is the total, and change is zero
      setAmountPaid(grandTotal.toFixed(2));
      setChange(0);
    }
  }, [amountPaid, grandTotal, paymentMethod]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Main Action Handler ---
  const handleConfirmPayment = async () => {
    setIsLoading(true);
    setStatusMessage('');

    try {
      // 1. Call the backend to update the stock levels
      const response = await axios.post('/api/products/update-stock', { cart: orderSummary });

      if (response.data.success) {
        setStatusMessage('✅ Payment successful! Inventory updated.');
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('totalAmount');

        // 2. Navigate to a receipt or dashboard after a delay
        setTimeout(() => {
            navigate('/dashboard'); // Or navigate to a new receipt page
        }, 2000);
      } else {
          throw new Error(response.data.message || 'Failed to update inventory');
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
        <div className="stepper">
          {/* Stepper can be a separate component if you prefer */}
        </div>
        <div className="payment-confirmation-box">
          <div className="confirmation-header">
            <button className="back-button-style" onClick={() => navigate(-1)}>‹</button>
            <h2>Payment Confirmation</h2>
          </div>
          <p className="invoice-id">Invoice ID: 001</p>

          <div className="payment-details">
            <div className="mode-of-payment">
              <h3>Mode of Payment</h3>
              <div className="payment-options-group">
                <label>
                  <input type="radio" name="paymentMode" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} />
                  CASH
                </label>
                <label>
                  <input type="radio" name="paymentMode" value="GCASH" checked={paymentMethod === 'GCASH'} onChange={() => setPaymentMethod('GCASH')} />
                  GCash
                </label>
                <label>
                  <input type="radio" name="paymentMode" value="BANK" checked={paymentMethod === 'BANK'} onChange={() => setPaymentMethod('BANK')} />
                  Bank Transfer
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
            
            {/* Conditionally render Amount Paid and Change fields only for CASH */}
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
          
          {statusMessage && <p className={`status-message-final ${statusMessage.includes('failed') ? 'error' : 'success'}`}>{statusMessage}</p>}

          <button className="confirm-payment-button" onClick={handleConfirmPayment} disabled={isLoading || (paymentMethod === 'CASH' && parseFloat(amountPaid) < grandTotal)}>
            {isLoading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default RetailPayment;
