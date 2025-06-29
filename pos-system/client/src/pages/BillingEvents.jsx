import axios from 'axios';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './BillingEvents.css';
import UserProfile from './UserProfile';

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

  // Fetch data passed from the ProductSelection page
  const { eventDetails, selectedProducts = [] } = location.state || {};

  // Helper function to safely format date
  const formatDate = (dateValue) => {
    console.log('Date value received:', dateValue, 'Type:', typeof dateValue); // Debug log
    
    if (!dateValue) return 'No date provided';
    
    try {
      // Handle different date formats
      let date;
      
      // If it's already a Date object
      if (dateValue instanceof Date) {
        date = dateValue;
      }
      // If it's a string, try to parse it
      else if (typeof dateValue === 'string') {
        // Try direct parsing first
        date = new Date(dateValue);
        
        // If that fails, try common formats
        if (isNaN(date.getTime())) {
          // Try MM/DD/YYYY format
          const mmddyyyy = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (mmddyyyy) {
            date = new Date(mmddyyyy[3], mmddyyyy[1] - 1, mmddyyyy[2]);
          }
          // Try DD/MM/YYYY format
          else {
            const ddmmyyyy = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddmmyyyy) {
              date = new Date(ddmmyyyy[3], ddmmyyyy[2] - 1, ddmmyyyy[1]);
            }
          }
        }
      }
      // If it's a number (timestamp)
      else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      else {
        return 'Invalid date format';
      }
      
      // Check if the final date is valid
      if (isNaN(date.getTime())) {
        console.log('Failed to parse date:', dateValue); // Debug log
        return 'Invalid date format';
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Date format error';
    }
  };

  // Calculate the subtotal from the selected products
  const subtotal = selectedProducts.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountError, setDiscountError] = useState('');
  
  // Calculate discount amount from percentage
  const calculatedDiscountAmount = (subtotal * discountPercentage) / 100;
  const grandTotal = subtotal - calculatedDiscountAmount;

  const handleDiscountChange = (e) => {
    const percentage = parseFloat(e.target.value) || 0;
    // Limit percentage between 0 and 100
    const validPercentage = Math.max(0, Math.min(100, percentage));
    setDiscountPercentage(validPercentage);
    setDiscountError('');
  };

  const handleProceedToPayment = () => {
    navigate('/events-payment', {
      state: { 
        eventDetails,
        orderSummary: selectedProducts,
        subtotal,
        discountPercentage,
        discountAmount: calculatedDiscountAmount,
        grandTotal
      } 
    });
  };
  
  // Fallback if the user navigates here directly without event data
  if (!eventDetails) {
      return (
          <div>
              <h2>No event data found.</h2>
              <button onClick={() => {
                if (user?.role === 'employee') {
                  navigate('/employee-dashboard/events');
                } else {
                  navigate('/events');
                }
              }}>Go back to Events</button>
          </div>
      )
  }

  return (
    <div className="billing-page-container">
        <header className="billing-header">
            <h1>Billing for events</h1>
            <div className="user-profile">
                <UserProfile />
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
                        <div className="detail-item"><label>Date:</label><div className="detail-value">{formatDate(eventDetails.eventDate || eventDetails.date)}</div></div>
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
                        <div className="summary-row"><span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span></div>
                        <div className="summary-row"><span className="discount-text">Discount ({discountPercentage}%):</span><span className="discount-text">- ₱{calculatedDiscountAmount.toFixed(2)}</span></div>
                        <div className="summary-row total"><span>Total Amount:</span><span>₱{grandTotal.toFixed(2)}</span></div>
                    </div>
                    <div className="discount-section">
                        <div className="percentage-discount">
                            <label htmlFor="discount-percentage">Discount Percentage:</label>
                            <div className="percentage-input-group">
                                <input 
                                    id="discount-percentage"
                                    type="number" 
                                    value={discountPercentage} 
                                    onChange={handleDiscountChange} 
                                    placeholder="0" 
                                    min="0" 
                                    max="100"
                                    step="0.1"
                                />
                                <span className="percentage-symbol">%</span>
                            </div>
                        </div>
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
