import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css'; // Both payment pages can share this CSS for a consistent look
import UserProfile from './UserProfile'; // Assuming UserProfile component exists

const Stepper = ({ currentStep }) => (
    <div className="stepper-container">
      <div className="step complete"><div className="step-icon">✓</div><div className="step-label">Billing</div></div>
      <div className="stepper-line"></div>
      <div className={`step ${currentStep === 'payment' ? 'active' : ''}`}><div className="step-icon"></div><div className="step-label">Payment</div></div>
    </div>
);

function EventsPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // The full event object is passed in `eventDetails`
  const { eventDetails, orderSummary, subtotal, discountAmount, grandTotal } = location.state || {};

  // State for the new payment being made
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Default payment method
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Calculate totals based on the event data fetched from the database
  const totalCost = eventDetails?.totalAmount || grandTotal || 0;
  const amountAlreadyPaid = eventDetails?.totalPaid || 0;
  const remainingBalance = eventDetails?.remainingBalance || totalCost - amountAlreadyPaid;

  const handleFileChange = (e) => {
    setProofOfPayment(e.target.files[0]);
  };
  
  const handleConfirmPayment = async () => {
    const paymentAmount = parseFloat(newPaymentAmount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setStatusMessage('❌ Please enter a valid payment amount.');
      return;
    }
    if (paymentAmount > remainingBalance) {
        setStatusMessage(`❌ Payment cannot exceed the remaining balance of ₱${remainingBalance.toFixed(2)}.`);
        return;
    }

    setIsLoading(true);
    setStatusMessage('');

    const newPaymentData = {
        amountPaid: paymentAmount,
        paymentMethod: paymentMethod,
        proofOfPayment: proofOfPayment?.name 
    };

    const eventUpdateData = {
        products: orderSummary,
        subtotal,
        discountAmount,
        newPayment: newPaymentData
    };

    try {
      const response = await axios.put(`/api/events/update/${eventDetails._id}`, eventUpdateData);

      if (response.data.success) {
        setStatusMessage('✅ Payment successfully recorded!');
        setTimeout(() => navigate('/events'), 2000); 
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to record payment.';
      setStatusMessage(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!eventDetails) {
    return <div>Error: No event details found. Please return to the events calendar.</div>
  }

  return (
    <div className="payment-page-container">
        <header className="payment-header">
            <h1>Payment</h1>
            <UserProfile />
        </header>
        <main className="payment-main-content">
            <Stepper currentStep="payment" />
            <div className="payment-two-panel-layout">
                {/* Left Panel */}
                <div className="payment-left-panel">
                    <div className="confirmation-header">
                        <button className="back-button-style" onClick={() => navigate(-1)}>‹</button>
                        <h2>Payment Confirmation</h2>
                    </div>
                    <p className="invoice-id">Event For: {eventDetails.customerName}</p>

                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        {/* --- FIX: Added fallback to empty array to prevent crash --- */}
                        {(orderSummary || []).map((item, index) => (
                            <div className="summary-item" key={index}>
                                <span className="item-details">{item.quantity} pc(s) <strong>{item.productName}</strong></span>
                                <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="price-breakdown">
                        <div className="price-line"><span>Subtotal:</span><span>₱{(subtotal || 0).toFixed(2)}</span></div>
                        <div className="price-line"><span className="discount-text">Discounts:</span><span className="discount-text">- ₱{(discountAmount || 0).toFixed(2)}</span></div>
                        <div className="price-line total"><span>Total Event Cost:</span><span>₱{(grandTotal || 0).toFixed(2)}</span></div>
                        <div className="price-line"><span>Amount Paid:</span><span>- ₱{amountAlreadyPaid.toFixed(2)}</span></div>
                        <div className="price-line change"><span>Remaining Balance:</span><span>₱{remainingBalance.toFixed(2)}</span></div>
                    </div>
                    
                    <div className="cash-payment-details">
                        <div className="price-line amount-paid">
                            <span>Enter New Payment:</span>
                            <input 
                                type="number" 
                                value={newPaymentAmount} 
                                onChange={(e) => setNewPaymentAmount(e.target.value)} 
                                placeholder="0.00" 
                            />
                        </div>
                    </div>

                    <div className="mode-of-payment">
                        <h3>Mode of Payment</h3>
                        <div className="payment-method-buttons">
                          <button className={`payment-method-btn ${paymentMethod === 'Cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('Cash')}>Cash</button>
                          <button className={`payment-method-btn ${paymentMethod === 'GCash' ? 'active' : ''}`} onClick={() => setPaymentMethod('GCash')}>GCash</button>
                          <button className={`payment-method-btn ${paymentMethod === 'Bank' ? 'active' : ''}`} onClick={() => setPaymentMethod('Bank')}>Bank Transfer</button>
                        </div>
                    </div>
                    
                    {statusMessage && <p className={`status-message-final ${statusMessage.includes('failed') || statusMessage.includes('Error') ? 'error' : 'success'}`}>{statusMessage}</p>}

                    <button 
                        className="confirm-payment-button" 
                        onClick={handleConfirmPayment}
                        disabled={isLoading || !newPaymentAmount}>
                        {isLoading ? 'Processing...' : 'Save Payment Details'}
                    </button>
                </div>

                {/* Right Panel */}
                <div className="payment-right-panel">
                    {(paymentMethod === 'GCASH' || paymentMethod === 'BANK') ? (
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
                    ) : (
                         <div className="payment-instructions">
                           <h4>Payment History</h4>
                            <div className="payment-history-list">
                                {/* --- FIX: Added fallback to empty array to prevent crash --- */}
                                {(eventDetails?.paymentHistory || []).map((payment, index) => (
                                    <div key={index} className="history-item">
                                        <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                        <span>{payment.paymentMethod}</span>
                                        <span>₱{payment.amountPaid.toFixed(2)}</span>
                                    </div>
                                ))}
                                {(eventDetails?.paymentHistory || []).length === 0 && (
                                    <p className="no-history">No payments recorded yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}

export default EventsPayment;
