import { useLocation, useNavigate } from 'react-router-dom';
import './BillingEvents.css';

function BillingEvents() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve the selected flowers and form data from the previous page
  const { selectedFlowers, finalData } = location.state || {};

  // Calculate total price for selected products (based on quantity and price)
  const totalPrice = selectedFlowers?.reduce((acc, flower) => acc + (flower.price * flower.quantity), 0) || 0;
  const discount = 100; // For example, hardcoded discount (can be dynamic)
  const finalAmount = totalPrice - discount;

  // Handle save and proceed to payment
  const handleProceedToPayment = () => {
    navigate('/payment'); // Redirect to the payment page
  };

  return (
    <div className="billing-events-container">
      <div className="billing-events-header">
        <h2>Billing for Events</h2>
        <div className="user-profile">
          <img src="path/to/profile-icon" alt="User Profile" />
        </div>
      </div>

      <div className="billing-events-content">
        {/* Left Section: Order Details */}
        <div className="order-details">
          <h3>Order Details</h3>
          <p><strong>Invoice ID:</strong> 001</p>
          <p><strong>Customer Name:</strong> {finalData?.customerName || 'John Doe'}</p>
          <p><strong>Date:</strong> {finalData?.date || '10/26/2024'}</p>
          <p><strong>Events Address:</strong> {finalData?.address || '123 Maple Street, Antipolo, City'}</p>
          <p><strong>Phone Number:</strong> {finalData?.phone || '09216854474'}</p>
          <p><strong>Products/Bundles Ordered:</strong> {selectedFlowers?.map(flower => flower.name).join(', ')}</p>
          <p><strong>Remarks:</strong> {finalData?.notes || 'No remarks'}</p>
        </div>

        {/* Right Section: Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-summary-details">
            <div>
              <p><strong>QTY.</strong></p>
            </div>
            <div>
              <p><strong>Ordered Products</strong></p>
            </div>
            <div>
              <p><strong>Price</strong></p>
            </div>

            {/* List each product with quantity and price */}
            {selectedFlowers?.map(flower => (
              <div key={flower.name} className="summary-item">
                <p>{flower.quantity}</p>
                <p>{flower.name}</p>
                <p>₱{flower.price * flower.quantity}</p>
              </div>
            ))}
          </div>

          {/* Discount */}
          <div className="order-summary-total">
            <p><strong>Price: </strong>₱{totalPrice}</p>
            <p><strong>Discount:</strong> ₱{discount}</p>
            <p><strong>Total Amount:</strong> ₱{finalAmount}</p>
          </div>

          <button className="proceed-payment-button" onClick={handleProceedToPayment}>
            Save & Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillingEvents;
