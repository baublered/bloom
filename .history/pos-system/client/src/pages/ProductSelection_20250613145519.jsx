import './BillingPage.css';

const BillingPage = () => {
  return (
    <div className="billing-container">
      <h1>Billing</h1>
      
      <section className="order-details">
        <h2>Order Details</h2>
        <h3>Invoice ID 001</h3>
        
        <div className="details-grid">
          <div className="customer-info">
            <div className="info-row">
              <span className="label">Customer Name:</span>
              <span className="value"><strong>Alexine Maloping</strong></span>
            </div>
            <div className="info-row">
              <span className="label">Events Address:</span>
              <span className="value"><strong>123 Maple Street Apartment 48 Springfield, Antipolo, City.</strong></span>
            </div>
            <div className="info-row">
              <span className="label">Phone number:</span>
              <span className="value"><strong>09216854474</strong></span>
            </div>
          </div>
          
          <div className="date-calendar">
            <div className="info-row">
              <span className="label">Date:</span>
              <span className="value"><strong>10/26/2024</strong></span>
            </div>
            
            <div className="calendar">
              <div className="month-header">October 2024</div>
              <div className="weekdays">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>
              <div className="days-grid">
                {[20, 30, 1, 2, 3, 4, 5].map((day) => (
                  <span key={`week1-${day}`}>{day}</span>
                ))}
                {[6, 7, 8, 9, 10, 11, 12].map((day) => (
                  <span key={`week2-${day}`}>{day}</span>
                ))}
                {[13, 14, 15, 16, 17, 18, 19].map((day) => (
                  <span key={`week3-${day}`}>{day}</span>
                ))}
                {[20, 21, 22, 23, 24, 25, 26].map((day) => (
                  <span key={`week4-${day}`}>{day}</span>
                ))}
                {[27, 28, 29, 30, 31, 1, 2].map((day) => (
                  <span key={`week5-${day}`}>{day}</span>
                ))}
                {[3, 4, 3, 6, 7, 8, 9].map((day, index) => (
                  <span key={`week6-${index}`}>{day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="products-ordered">
          <h4>Products/Bundles Ordered</h4>
          <p>Wedding bundles</p>
        </div>
        
        <div className="remarks">
          <h4>Remarks:</h4>
          <p>Yellow-themed wedding</p>
        </div>
      </section>
      
      <hr className="divider" />
      
      <section className="payment-section">
        <h2>Payment</h2>
        
        <div className="payment-details">
          <div className="payment-row">
            <span className="payment-label"><strong>OTY:</strong></span>
            <span className="payment-value">Ordered Products</span>
          </div>
          
          <div className="payment-row">
            <span className="payment-label"><strong>Price:</strong></span>
            <span className="payment-value">Wedding Bundle</span>
          </div>
          
          <div className="payment-row highlight">
            <span className="payment-label"><strong>P11.500.00</strong></span>
            <span className="payment-value">Monthly: Yellow-themed wedding</span>
          </div>
          
          <div className="payment-row">
            <span className="payment-label"><strong>Price:</strong></span>
            <span className="payment-value">P115.00</span>
          </div>
          
          <div className="payment-row">
            <span className="payment-label"><strong>Discounts:</strong></span>
            <span className="payment-value">123SALE</span>
          </div>
          
          <div className="payment-row total">
            <span className="payment-label"><strong>Total Amount:</strong></span>
            <span className="payment-value"><strong>P105.00</strong></span>
          </div>
        </div>
        
        <button className="proceed-button">Save & Proceed to Payment</button>
      </section>
    </div>
  );
};

export default BillingPage;