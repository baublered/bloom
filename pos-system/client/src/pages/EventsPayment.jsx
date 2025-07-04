import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css'; // Both payment pages can share this CSS for a consistent look
import UserProfile from './UserProfile';

const Stepper = ({ currentStep }) => (
    <div className="stepper-container">
      <div className="step complete">
        <div className="step-icon">✓</div>
        <div className="step-label">Billing</div>
      </div>
      <div className="stepper-line"></div>
      <div className={`step ${currentStep === 'payment' ? 'active' : ''}`}>
        <div className="step-icon"></div>
        <div className="step-label">Payment</div>
      </div>
    </div>
);

function EventsPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from the previous page
  const { orderSummary = [], eventDetails = {}, grandTotal = 0, subtotal = 0, discountAmount = 0, discountPercentage = 0 } = location.state || {};

  // Use the correct values prioritizing what's stored in eventDetails
  const correctSubtotal = eventDetails.subtotal || subtotal;
  const correctDiscountAmount = eventDetails.discountAmount || discountAmount;
  const correctDiscountPercentage = eventDetails.discountPercentage || discountPercentage;
  const correctGrandTotal = eventDetails.totalAmount || grandTotal;

  console.log('🔧 EventsPayment Values Check:', {
    'Passed grandTotal': grandTotal,
    'Event totalAmount': eventDetails.totalAmount,
    'Using correctGrandTotal': correctGrandTotal,
    'Event subtotal': eventDetails.subtotal,
    'Event discountAmount': eventDetails.discountAmount,
    'Event discountPercentage': eventDetails.discountPercentage
  });

  // State management for all payment types
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Downpayment functionality
  const [isDownpayment, setIsDownpayment] = useState(false);
  const [downpaymentAmount, setDownpaymentAmount] = useState(10000); // Default to the minimum
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [existingDownpayment, setExistingDownpayment] = useState(0);
  const [hasExistingDownpayment, setHasExistingDownpayment] = useState(false);
  const [downpaymentError, setDownpaymentError] = useState('');

  // COMBINED useEffect to manage all balance calculations and prevent race conditions
  useEffect(() => {
    const existingDownpaymentAmount = eventDetails.paymentHistory
      ?.filter(p => p.isDownpayment === true)
      .reduce((total, p) => total + p.amountPaid, 0) || 0;

    console.log('🔍 EventsPayment Debug Info:', {
      eventDetails,
      passedGrandTotal: grandTotal,
      correctGrandTotal,
      correctSubtotal,
      correctDiscountAmount,
      correctDiscountPercentage,
      existingDownpaymentAmount,
      eventTotalAmount: eventDetails.totalAmount,
      eventSubtotal: eventDetails.subtotal,
      eventDiscountAmount: eventDetails.discountAmount
    });

    if (existingDownpaymentAmount > 0) {
      // Case 1: An existing downpayment is found.
      setHasExistingDownpayment(true);
      setExistingDownpayment(existingDownpaymentAmount);
      
      // Calculate remaining balance correctly: Correct Total - Existing Downpayment
      const calculatedRemainingBalance = correctGrandTotal - existingDownpaymentAmount;
      
      console.log('🔍 Final payment calculation:', {
        correctGrandTotal,
        existingDownpaymentAmount,
        calculatedRemainingBalance
      });
      
      setRemainingBalance(Math.max(0, calculatedRemainingBalance)); // Ensure it's not negative
      setIsDownpayment(false); // Can't make a new downpayment if one exists

    } else {
      // Case 2: No existing downpayment. Handle new payments (full or downpayment).
      setHasExistingDownpayment(false);
      setExistingDownpayment(0);

      // New logic: Automatically disable downpayment if total is less than 10,000
      if (correctGrandTotal < 10000) {
        setIsDownpayment(false);
      }

      if (isDownpayment) {
        // User is making a NEW downpayment.
        const amount = parseFloat(downpaymentAmount) || 0;
        
        // Validate the downpayment amount
        if (amount < 10000) {
          setDownpaymentError('Minimum downpayment is ₱10,000.');
        } else if (amount >= correctGrandTotal) {
          setDownpaymentError('Downpayment must be less than the total amount.');
        } else {
          setDownpaymentError('');
        }
        
        const validAmount = Math.min(amount, correctGrandTotal);
        setRemainingBalance(correctGrandTotal - validAmount);
      } else {
        // User is making a FULL payment.
        setDownpaymentAmount(correctGrandTotal);
        setRemainingBalance(0);
        setDownpaymentError(''); // Clear any previous errors
      }
    }
  }, [eventDetails, correctGrandTotal, isDownpayment, downpaymentAmount]);


  // --- RESTORED: useEffect to calculate change for CASH payments ---
  useEffect(() => {
    let amountToPay;
    if (hasExistingDownpayment) {
      // If there's already a downpayment, they need to pay the remaining balance
      amountToPay = remainingBalance;
    } else {
      // If no existing downpayment, use the normal logic
      amountToPay = isDownpayment ? downpaymentAmount : correctGrandTotal;
    }
    
    if (paymentMethod === 'CASH') {
      const paid = parseFloat(amountPaid);
      if (!isNaN(paid) && paid >= amountToPay) {
        setChange(paid - amountToPay);
      } else {
        setChange(0);
      }
    } else {
      // For other methods, no change calculation is needed on this screen
      setAmountPaid('');
      setChange(0);
    }
  }, [amountPaid, correctGrandTotal, downpaymentAmount, isDownpayment, paymentMethod, hasExistingDownpayment, remainingBalance]);
  
  const handleFileChange = (e) => {
    setProofOfPayment(e.target.files[0]);
  };

  const handleConfirmPayment = async () => {
    let amountToPay;
    if (hasExistingDownpayment) {
      // If there's already a downpayment, they need to pay the remaining balance
      amountToPay = remainingBalance;
    } else {
      // If no existing downpayment, use the normal logic
      amountToPay = isDownpayment ? downpaymentAmount : correctGrandTotal;
    }
    
    if (paymentMethod === 'CASH' && (parseFloat(amountPaid) < amountToPay || !amountPaid)) {
        setStatusMessage('❌ Cash paid is less than the required amount.');
        return;
    }
    if ((paymentMethod === 'GCASH' || paymentMethod === 'BANK') && !proofOfPayment) {
        setStatusMessage('❌ Please upload proof of payment.');
        return;
    }
    if (isDownpayment && downpaymentError) {
        setStatusMessage(`❌ ${downpaymentError}`);
        return;
    }
    
    setIsLoading(true);
    setStatusMessage('');

    // --- UPDATED LOGIC FOR EVENTS WITH DOWNPAYMENT ---
    // Use the correct total amount (from eventDetails if available, otherwise grandTotal)
    const correctTotalAmount = eventDetails.totalAmount || grandTotal;
    
    const eventUpdateData = {
        products: orderSummary,
        subtotal: correctSubtotal,
        discountAmount: correctDiscountAmount,
        discountPercentage: correctDiscountPercentage,
        totalAmount: correctGrandTotal, // Use the correct discounted total
        remainingBalance: hasExistingDownpayment ? 0 : (isDownpayment ? remainingBalance : 0),
        status: hasExistingDownpayment ? 'Fully Paid' : (isDownpayment ? 'Pending' : 'Fully Paid'),
        newPayment: {
            amountPaid: hasExistingDownpayment ? remainingBalance : (isDownpayment ? downpaymentAmount : correctGrandTotal),
            paymentMethod: paymentMethod,
            proofOfPayment: proofOfPayment?.name,
            isDownpayment: hasExistingDownpayment ? false : isDownpayment,
            downpaymentAmount: hasExistingDownpayment ? 0 : (isDownpayment ? downpaymentAmount : correctGrandTotal)
        }
    };

    console.log('🚀 Sending eventUpdateData:', eventUpdateData);

    try {
      // Call the backend endpoint to UPDATE the event
      const response = await axios.put(`/api/events/update/${eventDetails._id}`, eventUpdateData);

      if (response.data.success) {
        setStatusMessage('✅ Event payment details saved successfully!');
        
        // --- REFINED NAVIGATION STATE for RECEIPT ---
        const receiptState = {
            orderSummary: orderSummary.map(item => ({
                ...item,
                price: item.price || 0,
                quantity: item.quantity || 1,
                productName: item.productName || 'Unknown Item'
            })),
            grandTotal: correctGrandTotal || 0,
            subtotal: correctSubtotal || 0,
            discountAmount: correctDiscountAmount || 0,
            eventDetails: eventDetails,
            paymentMethod: paymentMethod || 'CASH',
            change: change || 0,
            
            // Payment context for the receipt
            isEventTransaction: true,
            isFinalPayment: hasExistingDownpayment, // True if we were paying off a remaining balance
            
            // Amounts
            amountPaidNow: hasExistingDownpayment ? remainingBalance : (isDownpayment ? downpaymentAmount : correctGrandTotal),
            initialDownpayment: hasExistingDownpayment ? existingDownpayment : (isDownpayment ? downpaymentAmount : 0),
            finalRemainingBalance: hasExistingDownpayment ? 0 : (isDownpayment ? remainingBalance : 0),
        };

        setTimeout(() => navigate('/receipt', { state: receiptState }), 2000);
      } else {
        throw new Error(response.data.message || 'Failed to update event.');
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save event details.';
      setStatusMessage(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-page-container">
        <header className="payment-header">
            <h1>Payment</h1>
            <div className="user-profile"><UserProfile /></div>
        </header>
        <main className="payment-main-content">
            <Stepper currentStep="payment" />
            <div className="payment-two-panel-layout">
                <div className="payment-left-panel">
                    <div className="confirmation-header">
                        <button className="back-button-style" onClick={() => navigate(-1)}>‹</button>
                        <h2>Payment Confirmation</h2>
                    </div>
                    <p className="invoice-id">Event For: {eventDetails.customerName || 'N/A'}</p>
                    
                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        {orderSummary.map((item, index) => (
                            <div className="summary-item" key={index}>
                                <span className="item-details">{item.quantity} pc(s) <strong>{item.productName}</strong></span>
                                <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="price-breakdown">
                         <div className="price-line"><span>Subtotal:</span><span>₱{correctSubtotal.toFixed(2)}</span></div>
                         <div className="price-line"><span className="discount-text">Discount ({correctDiscountPercentage}%):</span><span className="discount-text">- ₱{correctDiscountAmount.toFixed(2)}</span></div>
                         <div className="price-line total"><span>Total amount:</span><span>₱{correctGrandTotal.toFixed(2)}</span></div>
                    </div>
                    
                    {/* Downpayment Section */}
                    <div className="downpayment-section">
                        {hasExistingDownpayment ? (
                            // Show existing downpayment info
                            <div className="existing-downpayment-info">
                                <div className="info-row">
                                    <span>Previous Downpayment:</span>
                                    <span className="amount">₱{existingDownpayment.toFixed(2)}</span>
                                </div>
                                <div className="info-row remaining-balance">
                                    <span>Remaining Balance to Pay:</span>
                                    <span className="amount">₱{remainingBalance.toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                            // Show normal downpayment option, only if total is >= 10,000
                            <>
                                {correctGrandTotal >= 10000 && (
                                  <div className="downpayment-toggle">
                                      <label className="downpayment-checkbox">
                                          <input 
                                              type="checkbox" 
                                              checked={isDownpayment} 
                                              onChange={(e) => {
                                                  const isChecked = e.target.checked;
                                                  setIsDownpayment(isChecked);
                                                  if (isChecked) {
                                                      // When switching to downpayment, default to 10k or current value if higher
                                                      setDownpaymentAmount(Math.max(10000, downpaymentAmount));
                                                  }
                                              }}
                                          />
                                          <span>Pay as downpayment only</span>
                                      </label>
                                  </div>
                                )}
                                
                                {isDownpayment && (
                                    <div className="downpayment-controls">
                                        <div className="downpayment-amount-input">
                                            <label>Downpayment amount:</label>
                                            <div className="amount-input-group">
                                                <span className="currency-symbol">₱</span>
                                                <input 
                                                    type="number" 
                                                    value={downpaymentAmount} 
                                                    onChange={(e) => setDownpaymentAmount(parseFloat(e.target.value) || 0)}
                                                    min="10000" 
                                                    max={correctGrandTotal - 0.01} // Must be less than total
                                                    step="0.01"
                                                    placeholder="10000.00"
                                                />
                                            </div>
                                    {downpaymentError ? (
                                      <small className="input-helper error">{downpaymentError}</small>
                                    ) : (
                                      <small className="input-helper">Enter amount between ₱10,000 and ₱{(correctGrandTotal - 0.01).toFixed(2)}</small>
                                    )}
                                </div>
                                <div className="downpayment-breakdown">
                                    <div className="price-line downpayment"><span>Downpayment amount:</span><span>₱{parseFloat(downpaymentAmount || 0).toFixed(2)}</span></div>
                                    <div className="price-line remaining"><span>Remaining balance:</span><span>₱{remainingBalance.toFixed(2)}</span></div>
                                </div>
                            </div>
                        )}
                            </>
                        )}
                        
                        <div className="amount-to-pay">
                            <div className="price-line final-total">
                                <span>Amount to pay now:</span>
                                <span>₱{(hasExistingDownpayment ? remainingBalance : (isDownpayment ? downpaymentAmount : correctGrandTotal)).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* --- RESTORED: Conditional rendering for cash payment details --- */}
                    {paymentMethod === 'CASH' && (
                        <div className="cash-payment-details">
                             <div className="price-line amount-paid">
                                <span>Total amount paid:</span>
                                <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="price-line change"><span>Change:</span><span>₱{change.toFixed(2)}</span></div>
                        </div>
                    )}

                    <div className="mode-of-payment">
                        <h3>Mode of Payment</h3>
                        <div className="payment-method-buttons">
                            <button className={`payment-method-btn ${paymentMethod === 'CASH' ? 'active' : ''}`} onClick={() => setPaymentMethod('CASH')}>Cash</button>
                            <button className={`payment-method-btn ${paymentMethod === 'GCASH' ? 'active' : ''}`} onClick={() => setPaymentMethod('GCASH')}>GCash</button>
                            <button className={`payment-method-btn ${paymentMethod === 'BANK' ? 'active' : ''}`} onClick={() => setPaymentMethod('BANK')}>Bank Transfer</button>
                        </div>
                    </div>
                    
                    {statusMessage && <p className={`status-message-final ${statusMessage.includes('failed') || statusMessage.includes('Error') ? 'error' : 'success'}`}>{statusMessage}</p>}

                    <button 
                        className="confirm-payment-button" 
                        onClick={handleConfirmPayment}
                        disabled={isLoading || !paymentMethod || (isDownpayment && !!downpaymentError) || (paymentMethod === 'CASH' && 
                            (parseFloat(amountPaid) < (hasExistingDownpayment ? remainingBalance : (isDownpayment ? downpaymentAmount : correctGrandTotal)) || !amountPaid))}>
                        {isLoading ? 'Processing...' : `Confirm ${hasExistingDownpayment ? 'Final Payment' : (isDownpayment ? 'Downpayment' : 'Full Payment')}`}
                    </button>
                </div>

                <div className="payment-right-panel">
                    {!paymentMethod && (
                        <div className="payment-placeholder"><p>Please select a payment method.</p></div>
                    )}
                    {(paymentMethod === 'GCASH' || paymentMethod === 'BANK') && (
                        <div className="payment-instructions">
                            <h4>Upload Proof of Payment</h4>
                            <p>Please upload a screenshot of your transaction confirmation.</p>
                            <div className="file-upload-container">
                                <label htmlFor="file-upload" className="file-upload-label">
                                    {proofOfPayment ? `Selected: ${proofOfPayment.name}` : 'Choose File'}
                                </label>
                                <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" />
                            </div>
                        </div>
                    )}
                     {paymentMethod === 'CASH' && (
                        <div className="payment-instructions">
                           <h4>Cash Payment</h4>
                           <p>Please prepare the exact amount or higher to receive change.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}

export default EventsPayment;
