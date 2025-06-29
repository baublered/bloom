import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BillingRetail.css';

// Stepper sub-component remains the same
const Stepper = ({ currentStep }) => {
  return (
    <div className="stepper-container">
      <div className={`step ${currentStep === 'billing' ? 'active' : ''}`}>
        <div className="step-icon"></div>
        <div className="step-label">Billing</div>
      </div>
      <div className="stepper-line"></div>
      <div className={`step ${currentStep === 'payment' ? 'active' : ''}`}>
        <div className="step-icon"></div>
        <div className="step-label">Payment</div>
      </div>
    </div>
  );
};

function BillingRetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedFlowers = location.state?.selectedFlowers || [];

  // All your original state and functions are preserved
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');

  const calculateTotalPrice = (quantity, price) => {
    return (quantity * price).toFixed(2);
  };

  const calculateGrandTotal = () => {
    const total = selectedFlowers.reduce((acc, flower) => {
      return acc + (flower.quantity * flower.price);
    }, 0);
    return (total - discountAmount).toFixed(2);
  };

  const handleDiscountChange = (e) => {
    setDiscountCode(e.target.value);
    setDiscountError('');
  };

  const applyDiscount = async () => {
    if (discountCode) {
      try {
        const response = await fetch(`http://localhost:5000/api/discounts/validate?code=${discountCode}`);
        const data = await response.json();
        
        if (data.valid) {
          setDiscountAmount(data.discountAmount);
        } else {
          setDiscountAmount(0);
          setDiscountError('Invalid or expired discount code');
        }
      } catch (error) {
        console.error('Error validating discount code:', error);
        setDiscountAmount(0);
        setDiscountError('Error validating the code. Please try again later.');
      }
    } else {
      setDiscountAmount(0);
      setDiscountError('Please enter a discount code');
    }
  };

  const handleProceedToPayment = () => {
    const grandTotal = calculateGrandTotal();
    const orderSummary = selectedFlowers.map(flower => ({
      name: flower.name,
      quantity: flower.quantity,
      price: flower.price,
      totalPrice: calculateTotalPrice(flower.quantity, flower.price),
      addOns: flower.addOns || 'None'
    }));

    navigate('/retail-payment', { 
      state: { 
        orderSummary,
        discountAmount,
        grandTotal
      } 
    });
  };

  return (
    <div className="billing-container">
      <div className="user-profile-header">
        <div className="user-profile-stub">
          <span>User Profile</span>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>
      <div className="billing-retail-layout">
        <Stepper currentStep="billing" />
        <div className="billing-content">
          {/* Left panel remains the same as my previous update */}
          <div className="billing-panel left-panel">
            <div className="order-details-header">
              <button className="back-arrow" onClick={() => navigate(-1)}>‹</button>
              <h3>Order Details</h3>
              <p>Invoice ID: 001</p>
            </div>
            
            <div className="order-table-header">
              <div className="order-table-cell">QTY.</div>
              <div className="order-table-cell product-cell">Product</div>
              <div className="order-table-cell">Price</div>
              <div className="order-table-cell">Total Price</div>
            </div>

            <div className="order-items-box">
              {selectedFlowers.map((flower, index) => (
                <div key={index} className="order-item-row">
                  <div className="order-table-cell">{flower.quantity} pc.</div>
                  <div className="order-table-cell product-cell">
                    {flower.name}
                    {flower.addOns && <div className="add-ons-text">Add-ons: {flower.addOns}</div>}
                  </div>
                  <div className="order-table-cell">P{flower.price.toFixed(2)}</div>
                  <div className="order-table-cell">P{calculateTotalPrice(flower.quantity, flower.price)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* START: Right Panel reverted to YOUR original code */}
          <div className="billing-panel right-panel">
            <h3>Order Summary</h3>
            <div className="order-summary-box original-summary">
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

            <div className="discount-section">
              <input
                type="text"
                value={discountCode}
                onChange={handleDiscountChange}
                placeholder="Enter discount code"
              />
              <button className="apply-button" onClick={applyDiscount}>Apply Discount</button>
              {discountError && <p className="error-message">{discountError}</p>}
            </div>
            
            <button className="proceed-button" onClick={handleProceedToPayment}>
              Save & Proceed to Payment
            </button>
          </div>
          {/* END: Right Panel reverted to YOUR original code */}

        </div>
      </div>
    </div>
  );
}

export default BillingRetail;