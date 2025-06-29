import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css'; // We will create this CSS file next

function RetailPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve data from the previous page (RetailTransaction)
  // Provide default empty arrays to prevent errors if the page is accessed directly
  const { selectedFlowers, selectedAddOns } = location.state || { selectedFlowers: [], selectedAddOns: [] };

  // State for payment calculations
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(10.00); // Example discount
  const [totalToBePaid, setTotalToBePaid] = useState(0);
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  
  // State for date and time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Effect to calculate totals when the component loads or data changes
  useEffect(() => {
    // 1. Calculate the subtotal from the selected flowers
    const calculatedSubtotal = selectedFlowers.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(calculatedSubtotal);

    // 2. Calculate the final amount after discount
    const finalAmount = calculatedSubtotal - discountAmount;
    setTotalToBePaid(finalAmount > 0 ? finalAmount : 0);
  }, [selectedFlowers, discountAmount]);

  // Effect to calculate change whenever the amount paid is updated
  useEffect(() => {
    const paid = parseFloat(amountPaid);
    if (!isNaN(paid) && paid >= totalToBePaid) {
      setChange(paid - totalToBePaid);
    } else {
      setChange(0);
    }
  }, [amountPaid, totalToBePaid]);

  // Effect to update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    // Cleanup the interval when the component is unmounted
    return () => clearInterval(timer);
  }, []);

  const handleConfirmPayment = () => {
    // Logic to save the transaction and navigate to the receipt page
    console.log("Payment Confirmed!");
    // You can pass all the necessary data to the receipt page via state
    navigate('/receipt', {
      state: {
        invoiceId: '001',
        selectedFlowers,
        selectedAddOns,
        subtotal,
        discountAmount,
        totalToBePaid,
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>User Profile</span>
        </div>
      </header>

      <main className="payment-main-content">
        {/* --- Stepper UI (inspired by image) --- */}
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
            {selectedFlowers.map((flower, index) => (
              <div className="summary-item" key={index}>
                <span className="item-details">
                  {flower.quantity} pc. &nbsp;<strong>{flower.name}</strong>
                  {index === 0 && selectedAddOns.length > 0 && ( /* Show add-ons with first item */
                    <span className="add-ons-display">Add-ons: {selectedAddOns.join(', ')}</span>
                  )}
                </span>
                <span className="item-price">₱{flower.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="price-breakdown">
            <div className="price-line">
              <span>Subtotal:</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
             <div className="price-line">
              <span>Discounts:</span>
              <span className="discount-text">- ₱{discountAmount.toFixed(2)}</span>
            </div>
            <div className="price-line total">
              <span>Total amount to be paid:</span>
              <span>₱{totalToBePaid.toFixed(2)}</span>
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
              <span>₱{change.toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="confirm-payment-button" 
            onClick={handleConfirmPayment}
            disabled={parseFloat(amountPaid) < totalToBePaid}
          >
            Confirm Payment
          </button>
        </div>
      </main>
    </div>
  );
}

export default RetailPayment;
