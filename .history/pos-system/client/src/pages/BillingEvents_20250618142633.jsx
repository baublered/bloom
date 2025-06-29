import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BillingEvents.css'; // I will provide an updated CSS file for this

const Stepper = ({ currentStep }) => (
    <div className="stepper-container">
      <div className={`step ${currentStep === 'billing' ? 'active' : ''}`}>
        <div className="step-icon"></div>
        <div className="step-label">Billing</div>
      </div>
      <div className="stepper-line"></div>
      <div className={`step ${currentStep === 'payment' ? '' : ''}`}>
        <div className="step-icon"></div>
        <div className="step-label">Payment</div>
      </div>
    </div>
);

function BillingEvents() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch data passed from the ProductSelection page
  const { eventDetails, selectedProducts = [] } = location.state || {};

  // Calculate the subtotal from the selected products
  const subtotal = selectedProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const grandTotal = subtotal - discountAmount;

  const handleDiscountChange = (e) => {
    setDiscountCode(e.target.value);
    setDiscountError('');
  };

  const applyDiscount = async () => {
    if (!discountCode) {
        setDiscountError('Please enter a discount code.');
        return;
    }
    setIsVerifying(true);
    setDiscountError('');
    try {
        const response = await axios.get(`/api/discounts/validate?code=${discountCode}`);
        const data = response.data;
        if (data.valid && typeof data.discountAmount === 'number') {
            setDiscountAmount(data.discountAmount);
        } else {
            setDiscountAmount(0);
            setDiscountError(data.error || 'Invalid discount code.');
        }
    } catch (error) {
        setDiscountAmount(0);
        setDiscountError('Error validating code.');
    } finally {
        setIsVerifying(false);
    }
  };

  const handleProceedToPayment = () => {
    navigate('/events-payment', { // Assuming a new payment route for events
      state: { 
        eventDetails,
        orderSummary: selectedProducts,
        subtotal,
        discountAmount,
        grandTotal
      } 
    });
  };
  
  // Fallback if the user navigates here directly without event data
  if (!eventDetails) {
      return (
          <div>
              <h2>No event data found.</h2>
              <button onClick={() => navigate('/events')}>Go back to Events</button>
          </div>
      )
  }

  return (
    <div className="billing-page-container">
        <header className="billing-header">
            <h1>Billing for events</h1>
            <div className="user-profile-button">
                <span>User Profile</span>
                <span className="dropdown-arrow">▼</span>
            </div>
        </header>
        <div className="billing-layout">
            <Stepper currentStep="billing" />
            <main className="billing-content">
                {/* Left Panel: Event & Order Details */}
                <div className="billing-panel">
                    <header className="panel-header">
                        <h3>Order Details</h3>
                        <p>Invoice ID: 001</p>
                    </header>
                    <div className="details-grid">
                        <div className="detail-item"><label>Customer Name:</label><div className="detail-value">{eventDetails.customerName}</div></div>
                        <div className="detail-item"><label>Date:</label><div className="detail-value">{new Date(eventDetails.date).toLocaleDateString()}</div></div>
                        <div className="detail-item full-width"><label>Events Address:</label><div className="detail-value">{eventDetails.address}</div></div>
                        <div className="detail-item"><label>Phone number:</label><div className="detail-value">{eventDetails.phone}</div></div>
                        <div className="detail-item"><label>Event Type:</label><div className="detail-value">{eventDetails.eventType}</div></div>
                        <div className="detail-item full-width"><label>Remarks:</label><div className="detail-value">{eventDetails.notes}</div></div>
                    </div>
                </div>
                {/* Right Panel: Order Summary */}
                <div className="billing-panel summary-panel">
                    <h3>Order Summary</h3>
                    <div className="order-summary-list">
                        <div className="summary-list-header">
                            <span>QTY.</span>
                            <span>Ordered Products</span>
                            <span>Price</span>
                        </div>
                        {selectedProducts.map(item => (
                            <div key={item._id} className="summary-list-item">
                                <span>{item.quantity}</span>
                                <span>{item.productName}</span>
                                <span className="price">₱{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-calculation">
                        <div className="summary-row"><span>Price:</span><span>₱{subtotal.toFixed(2)}</span></div>
                        <div className="summary-row"><span className="discount-text">Discounts:</span><span className="discount-text">- ₱{discountAmount.toFixed(2)}</span></div>
                        <div className="summary-row total"><span>Total Amount:</span><span>₱{grandTotal.toFixed(2)}</span></div>
                    </div>
                    <div className="discount-section">
                        <input type="text" value={discountCode} onChange={handleDiscountChange} placeholder="Enter discount code" />
                        <button className="apply-button" onClick={applyDiscount} disabled={isVerifying}>
                            {isVerifying ? '...' : 'Apply'}
                        </button>
                    </div>
                    {discountError && <p className="error-message">{discountError}</p>}
                    <button className="proceed-payment-button" onClick={handleProceedToPayment}>
                        Save & Proceed to Payment
                    </button>
                </div>
            </main>
        </div>
    </div>
  );
}

export default BillingEvents;
