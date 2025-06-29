import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BillingRetail.css';

function BillingRetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedFlowers = location.state?.selectedFlowers || []; // Retrieve selected flowers from the previous page

  // Discount code and amount
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState(''); // For displaying invalid code messages

  // Helper function to calculate total price
  const calculateTotalPrice = (quantity, price) => {
    return (quantity * price).toFixed(2); // Ensures two decimal points for the total price
  };

  // Helper function to calculate grand total and apply discounts
  const calculateGrandTotal = () => {
    const total = selectedFlowers.reduce((acc, flower) => {
      return acc + (flower.quantity * flower.price);
    }, 0);
    return (total - discountAmount).toFixed(2); // Apply discount to total
  };

  // Handle discount code input and apply discount
  const handleDiscountChange = (e) => {
    const code = e.target.value;
    setDiscountCode(code);
    setDiscountError(''); // Reset error message on input change
  };

  const applyDiscount = async () => {
    if (discountCode) {
      try {
        // API Call to backend to validate the discount code
        const response = await fetch(`http://localhost:5000/api/discounts/validate?code=${discountCode}`);
        const data = await response.json();
          
        if (data.valid) {
          // If valid, apply the discount
          setDiscountAmount(data.discountAmount);
        } else {
          // If invalid, reset the discount and show error
          setDiscountAmount(0);
          setDiscountError('Invalid or expired discount code');
        }
      } catch (error) {
        console.error('Error validating discount code:', error);
        setDiscountAmount(0); // Reset discount in case of an error
        setDiscountError('Error validating the code. Please try again later.');
      }
    } else {
      setDiscountAmount(0); // Reset discount if input is cleared
      setDiscountError('Please enter a discount code');
    }
  };

  // --- NEW HANDLER FOR PROCEEDING TO PAYMENT ---
  const handleProceedToPayment = () => {
    const grandTotal = calculateGrandTotal();
    const orderSummary = selectedFlowers.map(flower => ({
      name: flower.name,
      quantity: flower.quantity,
      price: flower.price,
      totalPrice: calculateTotalPrice(flower.quantity, flower.price),
      addOns: flower.addOns || 'None'
    }));

    navigate('/RetailPayment', { 
      state: { 
        orderSummary,
        discountAmount,
        grandTotal 
      } 
    });
  };
  // --- END NEW HANDLER ---

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
                  <div>Add-ons: {flower.addOns || 'None'}</div>
                  <div>Price: P{flower.price}</div>
                  <div>Total Price: P{calculateTotalPrice(flower.quantity, flower.price)}</div>
                </div>
              </div>
            ))}
            <div className="order-summary-item discount">
              <div>Discounts: </div>
              <div>-P{discountAmount.toFixed(2)}</div>
            </div>
            <div className="order-summary-item total">
              <div>Total Amount:</div>
              <div className="total-amount">P{calculateGrandTotal()}</div>
            </div>
          </div>

          {/* Discount Code Input and Apply Button */}
          <div className="discount-section">
            <input
              type="text"
              value={discountCode}
              onChange={handleDiscountChange} // Handle input changes
              placeholder="Enter discount code"
            />
            <button className="apply-button" onClick={applyDiscount}>Apply Discount</button>
            {/* Display error if discount code is invalid */}
            {discountError && <p className="error-message">{discountError}</p>}
          </div>
        </div>
      </div>

      <button className="proceed-button" onClick={handleProceedToPayment}>
        Save & Proceed to Payment
      </button>
    </div>
  );
}

export default BillingRetail;