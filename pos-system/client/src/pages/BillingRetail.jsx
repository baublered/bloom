import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BillingRetail.css';
import UserProfile from './UserProfile';

const Stepper = ({ currentStep }) => (
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

function BillingRetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getCartData = () => {
    const passedState = location.state;
    if (passedState && passedState.cart && typeof passedState.totalAmount === 'number') {
      return {
        cart: passedState.cart,
        totalAmount: passedState.totalAmount
      };
    }
    
    const savedCart = sessionStorage.getItem('cart');
    const savedTotal = sessionStorage.getItem('totalAmount');
    if (savedCart && savedTotal) {
      return {
        cart: JSON.parse(savedCart),
        totalAmount: parseFloat(savedTotal) || 0
      };
    }
    
    return { cart: [], totalAmount: 0 };
  };

  const { cart: cartItems, totalAmount: subtotal } = getCartData();

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
    navigate('/retail-payment', { 
      state: { 
        orderSummary: cartItems,
        subtotal,
        discountPercentage,
        discountAmount: calculatedDiscountAmount,
        grandTotal
      } 
    });
  };

  return (
    <div className="billing-page-container">
      <header className="billing-header">
      <div className="user-profile">
                <UserProfile />
        </div>
      </header>
      <div className="billing-layout">
        <Stepper currentStep="billing" />
        <main className="billing-content">
          <div className="billing-panel">
            <header className="panel-header">
              <button className="back-button" onClick={() => navigate(-1)}>‹</button>
              <h3>Order Details</h3>
              <p>Invoice ID: 001</p>
            </header>
            
            <div className="order-table">
              <div className="table-header">
                <div className="table-cell product-name">PRODUCT</div>
                <div className="table-cell">QTY</div>
                <div className="table-cell">PRICE</div>
                <div className="table-cell">TOTAL</div>
              </div>
              <div className="table-body">
                {cartItems.map((item) => (
                  <div key={item._id} className="table-row">
                    <div className="table-cell product-name">{item.productName}</div>
                    <div className="table-cell">{item.quantity || 1}</div>
                    <div className="table-cell">₱{(item.price || 0).toFixed(2)}</div>
                    <div className="table-cell">₱{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="billing-panel summary-panel">
             <h3>Order Summary</h3>
             <div className="summary-details">
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                    <span>Discount ({discountPercentage}%)</span>
                    <span className="discount-amount">-₱{calculatedDiscountAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>₱{grandTotal.toFixed(2)}</span>
                </div>
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
                Proceed to Payment
             </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BillingRetail;
