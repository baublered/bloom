import { useLocation, useNavigate } from 'react-router-dom';
import './BillingRetail.css';

function BillingRetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedFlowers = location.state?.selectedFlowers || []; // Retrieve selected flowers from the previous page

  // Helper function to calculate total price for each product
  const calculateTotalPrice = (quantity, price) => {
    return (quantity * price).toFixed(2); // Ensures two decimal points for the total price
  };

  // Helper function to calculate grand total and apply discounts
  const calculateGrandTotal = () => {
    const total = selectedFlowers.reduce((acc, flower) => {
      return acc + (flower.quantity * flower.price);
    }, 0);
    return total.toFixed(2); // Return the total price without applying discount yet
  };

  return (
    <div className="billing-container">
      <h2>Billing for Retail</h2>
      
      <div className="billing-content">
        {/* Left Panel: Order Details */}
        <div className="billing-panel left-panel">
          <div className="order-details-header">
            <button className="back-button" onClick={() => navigate('/retail')}>← Back</button>
            <h3>Order Details</h3>
            <p>Invoice ID: 001</p>
          </div>
          
          {/* First row with purple background */}
          <div className="order-details-header-row">
            <div className="order-details-cell">QTY.</div>
            <div className="order-details-cell">Product</div>
            <div className="order-details-cell">Price</div>
            <div className="order-details-cell">Total Price</div>
          </div>

          {/* Display order details for each selected flower */}
          <div className="order-details-box">
            {selectedFlowers.map((flower, index) => (
              <div key={index} className="order-details-row">
                <div className="order-details-cell">{flower.quantity} pc(s)</div>
                <div className="order-details-cell">{flower.name}</div>
                <div className="order-details-cell">P{flower.price}</div>
                <div className="order-details-cell">
                  P{calculateTotalPrice(flower.quantity, flower.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Order Summary */}
        <div className="billing-panel right-panel">
          <h3>Order Summary</h3>
          <div className="order-summary-box">
            {selectedFlowers.map((flower, index) => (
              <div key={index} className="order-summary-item">
                <div className="order-summary-details">
                  <div>{flower.quantity} pc(s) {flower.name}</div>
                  <div>Price: P{flower.price}</div>
                  <div>Total Price: P{calculateTotalPrice(flower.quantity, flower.price)}</div>
                </div>
              </div>
            ))}
            <div className="order-summary-item total">
              <div>Total Amount:</div>
              <div className="total-amount">P{calculateGrandTotal()}</div>
            </div>
          </div>
        </div>
      </div>

      <button className="proceed-button" onClick={() => navigate('/payment')}>
        Save & Proceed to Payment
      </button>
    </div>
  );
}

export default BillingRetail;
