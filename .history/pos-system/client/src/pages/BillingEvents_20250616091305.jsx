// BillingEvents.jsx

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default calendar styles
import { useLocation, useNavigate } from 'react-router-dom';
import './BillingEvents.css'; // Our custom styles will override the defaults

// You can reuse or create a similar header component
const UserProfileHeader = () => (
  <header className="user-profile-header">
    <div className="user-profile-dropdown">
      <span className="user-icon">👤</span>
      <span>User Profile</span>
      <span className="dropdown-arrow">▼</span>
    </div>
  </header>
);

// A simple component for the left-side stepper
const Stepper = () => (
    <div className="stepper">
        <div className="stepper-item active">
            <div className="stepper-dot"></div>
            <div className="stepper-label">Billing</div>
        </div>
        <div className="stepper-line"></div>
        <div className="stepper-item">
            <div className="stepper-dot"></div>
            <div className="stepper-label">Payment</div>
        </div>
    </div>
);


function BillingEvents() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve the state passed from the ProductSelection page
  const { eventDetails, selectedFlowers } = location.state || {};

  // Fallback for safe rendering if data is missing
  if (!eventDetails || !selectedFlowers) {
    return (
      <div className="billing-page">
        <p>Order data is missing. Please go back and complete the previous steps.</p>
        <button onClick={() => navigate('/transactions/events')}>Go to Events</button>
      </div>
    );
  }

  const subtotal = selectedFlowers.reduce((acc, flower) => acc + flower.totalPrice, 0);
  const discountAmount = 10.00; // Example discount
  const totalAmount = subtotal - discountAmount;
  
  // Format currency for display
  const formatCurrency = (amount) => `₱${amount.toFixed(2)}`;

  return (
    <div className="billing-page">
      <div className="billing-container">
        <UserProfileHeader />
        <h2 className="billing-title">Billing for events</h2>

        <div className="content-wrapper">
          <Stepper />

          <main className="main-content">
            {/* Left Panel: Order Details */}
            <section className="order-details">
              <h3>Order Details</h3>
              <p className="invoice-id">Invoice ID: 001</p>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Customer Name:</label>
                  <div className="detail-value">{eventDetails.customerName}</div>
                </div>

                <div className="detail-item date-container">
                  <label>Date:</label>
                  <div className="detail-value">{new Date(eventDetails.date).toLocaleDateString()}</div>
                  <Calendar 
                    value={new Date(eventDetails.date)}
                    className="mini-calendar"
                    view="month"
                  />
                </div>

                <div className="detail-item full-width">
                  <label>Events Address:</label>
                  <div className="detail-value">{eventDetails.address}</div>
                </div>
                
                <div className="detail-item">
                  <label>Phone number:</label>
                  <div className="detail-value">{eventDetails.phone}</div>
                </div>

                <div className="detail-item full-width">
                   <label>Products/Bundles Ordered:</label>
                   {/* This could be a summary or a specific field from the event form */}
                   <div className="detail-value">Wedding Bundle</div>
                </div>

                <div className="detail-item full-width">
                    <label>Remarks:</label>
                    <div className="detail-value">{eventDetails.notes}</div>
                </div>
              </div>
            </section>

            {/* Right Panel: Order Summary */}
            <aside className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                <div className="summary-header">
                  <span>QTY.</span>
                  <span>Ordered Products</span>
                  <span className="align-right">Price</span>
                </div>
                {selectedFlowers.map(item => (
                    <div className="summary-item" key={item.name}>
                        <span>{item.quantity}</span>
                        <div>
                            <p className="item-name">{item.name}</p>
                            {/* Assuming remark comes from eventDetails notes */}
                            <p className="item-remark">Remark: {eventDetails.notes}</p>
                        </div>
                        <span className="align-right">{formatCurrency(item.totalPrice)}</span>
                    </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="total-row">
                  <span>Price:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="total-row discount">
                  <span>Discounts:</span>
                  <div>
                    <span className="discount-code">123SALE</span>
                    <span className="original-price">{formatCurrency(discountAmount + 100)}</span> {/* Example original price */}
                    <span>{formatCurrency(-discountAmount)}</span>
                  </div>
                </div>
                <hr />
                <div className="total-row grand-total">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button className="proceed-button" onClick={() => navigate('/payment')}>
                Save & Proceed to Payment
              </button>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}

export default BillingEvents;