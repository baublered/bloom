import { useLocation, useNavigate } from 'react-router-dom';
import './Receipt.css'; // We'll create this CSS file

const Stepper = () => (
    <div className="stepper-container">
      <div className="step complete">
        <div className="step-icon">✓</div>
        <div className="step-label">Billing</div>
      </div>
      <div className="stepper-line"></div>
      <div className="step complete">
        <div className="step-icon">✓</div>
        <div className="step-label">Payment</div>
      </div>
    </div>
);


const Receipt = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get the final order details from the payment page
    const { 
        orderSummary = [], 
        grandTotal = 0, 
        subtotal = 0, 
        discountAmount = 0,
        amountPaid = 0,
        change = 0,
    } = location.state || {};
    
    // Fallback for direct navigation
    if (orderSummary.length === 0) {
        return (
            <div className="receipt-page">
                <p>No receipt data found. Please complete a transaction first.</p>
                <button onClick={() => navigate('/retail')}>Go to Retail</button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };
    
    const handleDone = () => {
        navigate('/dashboard'); // Navigate back to the main dashboard
    };

    return (
        <div className="receipt-page">
             <header className="receipt-page-header">
                <h1>Receipt</h1>
                <div className="user-profile">
                        <UserProfile />
        </div>
            </header>
            <main className="receipt-main-content">
                <Stepper />
                <div className="receipt-area">
                    <div className="receipt-paper" id="printable-receipt">
                        <div className="receipt-header">
                            <h2>Flowers by Edmar</h2>
                            <p>Antipolo, City</p>
                        </div>
                        <div className="receipt-info">
                            <div className="info-left">
                                <p>Invoice ID: 001</p>
                                <p>Cashier Name: Employee 1</p>
                            </div>
                            <div className="info-right">
                                <p>{new Date().toLocaleDateString()}</p>
                                <p>{new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className="receipt-orders">
                            <h3>Orders:</h3>
                            {orderSummary.map(item => (
                                <div className="order-item" key={item._id}>
                                    <p className="item-name">{item.quantity} pc. &nbsp;<strong>{item.productName}</strong></p>
                                    <p className="item-price">P{item.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="receipt-summary">
                             <div className="summary-line">
                                <span>Discounts:</span>
                                <span className="discount-text">- P{discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="summary-line total">
                                <span>Total amount to be paid:</span>
                                <span>P{grandTotal.toFixed(2)}</span>
                            </div>
                             <div className="summary-line">
                                <span>Total amount paid:</span>
                                <span>P{parseFloat(amountPaid).toFixed(2)}</span>
                            </div>
                             <div className="summary-line change">
                                <span>Change:</span>
                                <span>P{change.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="receipt-actions">
                        <button className="print-button" onClick={handlePrint}>Print Receipt</button>
                        <button className="done-button" onClick={handleDone}>Done</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Receipt;
