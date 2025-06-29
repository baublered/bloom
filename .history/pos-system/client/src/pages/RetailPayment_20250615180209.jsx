import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css'; // We will create this CSS file next

function RetailPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve data from the previous page (BillingRetail)
  const { orderSummary, discountAmount, grandTotal } = location.state || { orderSummary: [], discountAmount: 0, grandTotal: 0 };

  // State for payment calculations
  const [subtotal, setSubtotal] = useState(0);
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);

  // State for date and time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Effect to calculate totals when the component loads or data changes
  useEffect(() => {
    // 1. Calculate the subtotal from the selected flowers
    const calculatedSubtotal = orderSummary.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(calculatedSubtotal);

    // 2. Set the total to be paid (grand total passed from BillingRetail)
  }, [orderSummary, discountAmount, grandTotal]);

  // Effect to calculate change whenever the amount paid is updated
  useEffect(() => {
    const paid = parseFloat(amountPaid);
    if (!isNaN(paid) && paid >= grandTotal) {
      setChange(paid - grandTotal);
    } else {
      setChange(0);
    }
  }, [amountPaid, grandTotal]);

  // Effect to update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirmPayment = () => {
    // Logic to save the transaction and navigate to the receipt page
    console.log("Payment Confirmed!");
    navigate('/receipt', {
      state: {
        invoiceId: '001',
        orderSummary,
        discountAmount,
        grandTotal,
        amountPaid,
        change,
        paymentDate: currentDateTime.toLocaleDateString(),
        paymentTime: currentDateTime.toLocaleTimeString(),
      },
    });
  };

  return (
    <div className="payment-page-container">
      {/* --- Top Header (inspired by image) --- */}
      <header className="payment-header">
        <h1>Payment</h1>
        <div className="user-profile-mock">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <span>User Profile</span>
        </div>
      </header>

      <main className="payment-main-content">
        {/* --- Stepper UI --- */}
        <div className="stepper">
          <div className="step active">
            <div className="step-circle"></div>
            <div className="step-label">Payment</div>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-circle"></div>
            <div className="step-label">Receipt</div>
          </div>
        </div>

        {/* --- Payment Confirmation Box --- */}
        <div className="payment-confirmation-box">
          <div className="confirmation-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <h2>Payment Confirmation</h2>
          </div>
          <p className="invoice-id">Invoice ID 001</p>

          <div className="payment-details">
            <div className="mode-of-payment">
              <h3>Mode of Payment</h3>
              <label>
                <input type="radio" name="paymentMode" value="CASH" defaultChecked />
                CASH
              </label>
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
                <span className="item-details">
                  {item.quantity} pc. &nbsp;<strong>{item.name}</strong>
                </span>
                <span className="item-price">₱{item.totalPrice}</span>
              </div>
            ))}
          </div>

          <div className="price-breakdown">
            <div className="price-line">
              <span>Subtotal:</span>
              <span>₱{subtotal}</span>
            </div>
            <div className="price-line">
              <span>Discounts:</span>
              <span className="discount-text">- ₱{discountAmount}</span>
            </div>
            <div className="price-line total">
              <span>Total amount to be paid:</span>
              <span>₱{grandTotal}</span>
            </div>
            <div className="price-line amount-paid">
              <span>Total amount paid:</span>
              <input 
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="price-line change">
              <span>Change:</span>
              <span>₱{change}</span>
            </div>
          </div>

          <button 
            className="confirm-payment-button" 
            onClick={handleConfirmPayment}
            disabled={parseFloat(amountPaid) < grandTotal}
          >
            Confirm Payment
          </button>
        </div>
      </main>
    </div>
  );
}

export default RetailPayment;
