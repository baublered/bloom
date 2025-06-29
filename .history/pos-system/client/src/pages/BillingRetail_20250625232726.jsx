import axios from 'axios';
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

      // --- FIX START ---
      // 1. Check for the correct property from the backend: 'discountAmount'.
      // 2. Remove the 'discountType' check as the backend doesn't send it.
      if (data.valid && typeof data.discountAmount === 'number') {
        // For now, we assume all discounts are fixed amounts based on your backend route.
        setDiscountAmount(data.discountAmount);
      } else {
        setDiscountAmount(0);
        // 3. Use the correct error property from the backend: 'data.error'.
        setDiscountError(data.error || 'Invalid discount code.');
      }
      // --- FIX END ---
      
    } catch (error) {
      console.error('Error validating discount code:', error);
      setDiscountAmount(0);
      setDiscountError(error.response?.data?.message || 'Error validating code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProceedToPayment = () => {
    navigate('/retail-payment', { 
      state: { 
        orderSummary: cartItems,
        subtotal,
        discountAmount,
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
                    <span>Discount</span>
                    <span className="discount-amount">-₱{discountAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>₱{grandTotal.toFixed(2)}</span>
                </div>
             </div>
             <div className="discount-section">
                <input
                  type="text"
                  value={discountCode}
                  onChange={handleDiscountChange}
                  placeholder="Enter discount code"
                  disabled={isVerifying}
                />
                <button className="apply-button" onClick={applyDiscount} disabled={isVerifying}>
                  {isVerifying ? 'Verifying...' : 'Apply'}
                </button>
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
