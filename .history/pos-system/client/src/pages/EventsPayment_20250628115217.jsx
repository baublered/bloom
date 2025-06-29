import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css'; // This can reuse the same CSS

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
  const { eventDetails } = location.state || {};
  
  // State for the new payment being made
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Default payment method
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Calculate totals based on the event data from the database
  const totalCost = eventDetails?.totalAmount || 0;
  const amountAlreadyPaid = eventDetails?.totalPaid || 0;
  const remainingBalance = eventDetails?.remainingBalance || 0;

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

    // This is the object for the new payment to be added to the history
    const newPaymentData = {
        amountPaid: paymentAmount,
        paymentMethod: paymentMethod,
    };

    try {
      // We call the update endpoint, sending only the new payment details
      const response = await axios.put(`/api/events/update/${eventDetails._id}`, {
          newPayment: newPaymentData
      });

      if (response.data.success) {
        setStatusMessage('✅ Payment successfully recorded!');
        // After success, navigate back to the calendar to see the updated status color
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
            <h1>Event Payment</h1>
        </header>
        <main className="payment-main-content">
            <Stepper currentStep="payment" />
            <div className="payment-two-panel-layout">
                {/* Left Panel */}
                <div className="payment-left-panel">
                    <div className="confirmation-header">
                        <button className="back-button-style" onClick={() => navigate(-1)}>‹</button>
                        <h2>Record Payment</h2>
                    </div>
                    <p className="invoice-id">For: {eventDetails.customerName}</p>

                    <div className="price-breakdown">
                        <div className="price-line"><span>Total Event Cost:</span><span>₱{totalCost.toFixed(2)}</span></div>
                        <div className="price-line"><span>Amount Already Paid:</span><span>- ₱{amountAlreadyPaid.toFixed(2)}</span></div>
                        <div className="price-line total"><span>Remaining Balance:</span><span>₱{remainingBalance.toFixed(2)}</span></div>
                    </div>
                    
                    <div className="cash-payment-details">
                        <div className="price-line amount-paid">
                            <span>New Payment Amount:</span>
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
                        {isLoading ? 'Processing...' : 'Record Payment'}
                    </button>
                </div>

                {/* Right Panel */}
                <div className="payment-right-panel">
                    <div className="payment-instructions">
                        <h4>Payment History</h4>
                        <div className="payment-history-list">
                            {eventDetails.paymentHistory.length > 0 ? (
                                eventDetails.paymentHistory.map((payment, index) => (
                                    <div key={index} className="history-item">
                                        <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                        <span>{payment.paymentMethod}</span>
                                        <span>₱{payment.amountPaid.toFixed(2)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-history">No payments recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}

export default EventsPayment;
