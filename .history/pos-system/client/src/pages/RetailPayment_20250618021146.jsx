import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RetailPayment.css'; // We will create this new CSS file

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

const RetailPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Safely get data passed from the billing page
    const { orderSummary = [], grandTotal = 0 } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('gcash'); // 'gcash' or 'bank'
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleConfirmPayment = async () => {
        setIsLoading(true);
        setStatusMessage('');

        try {
            // Call the new backend endpoint to update the stock
            const response = await axios.post('/api/products/update-stock', { cart: orderSummary });

            if (response.data.success) {
                setStatusMessage('✅ Payment successful! Inventory updated.');
                // Clear cart from session storage after successful transaction
                sessionStorage.removeItem('cart');
                sessionStorage.removeItem('totalAmount');
                
                // Redirect to a success page or dashboard after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Failed to update inventory.');
            }
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
            setStatusMessage(`❌ ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="payment-page-container">
            <header className="payment-header">
                {/* User profile can be added back here if needed */}
            </header>
            <div className="payment-layout">
                <Stepper currentStep="payment" />
                <main className="payment-content">
                    {/* Left Panel: Payment Method Selection */}
                    <div className="payment-panel">
                        <h3>Mode of Payment</h3>
                        <div className="payment-options">
                            <div 
                                className={`payment-option ${paymentMethod === 'gcash' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('gcash')}>
                                GCash
                            </div>
                            <div 
                                className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('bank')}>
                                Bank Transfer
                            </div>
                        </div>

                        <div className="payment-instructions">
                            {paymentMethod === 'gcash' && (
                                <div className="qr-code-container">
                                    <p>Scan the QR Code to pay with GCash</p>
                                    <img src="https://placehold.co/250x250/0D6EFD/FFFFFF?text=GCash+QR" alt="GCash QR Code" />
                                    <p className="account-details"><strong>Account Name:</strong> BloomTrack Inc.</p>
                                    <p className="account-details"><strong>Account Number:</strong> 0917-123-4567</p>
                                </div>
                            )}
                            {paymentMethod === 'bank' && (
                                <div className="qr-code-container">
                                    <p>Scan the QR Code for bank transfer</p>
                                     <img src="https://placehold.co/250x250/28A745/FFFFFF?text=Bank+QR" alt="Bank Transfer QR Code" />
                                    <p className="account-details"><strong>Bank:</strong> BDO Unibank</p>
                                    <p className="account-details"><strong>Account Name:</strong> BloomTrack Inc.</p>
                                    <p className="account-details"><strong>Account Number:</strong> 1234-5678-9012</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right Panel: Final Summary */}
                    <div className="payment-panel summary-panel">
                        <h3>Final Summary</h3>
                        <div className="final-summary-items">
                            {orderSummary.map(item => (
                                <div key={item._id} className="summary-item-row">
                                    <span>{item.quantity}x {item.productName}</span>
                                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="final-total">
                            <span>Total Amount</span>
                            <span>₱{grandTotal.toFixed(2)}</span>
                        </div>
                        {statusMessage && <p className={`status-message ${statusMessage.includes('failed') ? 'error' : 'success'}`}>{statusMessage}</p>}
                        <button 
                            className="confirm-payment-button"
                            onClick={handleConfirmPayment}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RetailPayment;
