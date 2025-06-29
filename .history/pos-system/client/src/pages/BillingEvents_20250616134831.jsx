import { useLocation, useNavigate } from 'react-router-dom';
import './BillingEvents.css';

function BillingEvents() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve the selected flowers and form data from the previous page
  const { selectedFlowers, finalData } = location.state || {};

  // Calculate total price for selected products (based on quantity and price)
  const totalPrice = selectedFlowers?.reduce((acc, flower) => acc + (flower.price * flower.quantity), 0) || 0;
  const discount = 100; // Example hardcoded discount (can be dynamic)
  const finalAmount = totalPrice - discount;

  // Handle save and proceed to payment
  const handleProceedToPayment = () => {
    const finalOrderDetails = {
      customerName: finalData?.customerName,
      eventDate: finalData?.date,
      eventAddress: finalData?.address,
      phoneNumber: finalData?.phone,
      productsOrdered: finalData?.products,
      remarks: finalData?.remarks,
      selectedFlowers,  // Add the selected flowers here as well
    };

    console.log('Final Order Details:', finalOrderDetails);
    // Proceed to payment or other actions
    navigate('/payment'); // Redirect to the payment page
  };

  return (
    <div className="billing-events-container">
      <div className="billing-events-header">
        <h2>Billing for Events</h2>
      </div>

      <div className="billing-events-content">
        {/* Left Section: Order Details */}
        <div className="order-details-panel">
          <h3>Order Details</h3>
          <label htmlFor="customerName">Customer Name</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={finalData?.customerName || ''}
            readOnly
          />

          <label htmlFor="eventDate">Date</label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={finalData?.date || ''}
            readOnly
          />

          <label htmlFor="eventAddress">Events Address</label>
          <input
            type="text"
            id="eventAddress"
            name="eventAddress"
            value={finalData?.address || ''}
            readOnly
          />

          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            id="phoneNumber"
            name="phone"
            value={finalData?.phone || ''}
            readOnly
          />

          <label htmlFor="productsOrdered">Products/Bundles Ordered</label>
          <input
            type="text"
            id="productsOrdered"
            name="productsOrdered"
            value={finalData?.products || ''}
            readOnly
          />

          <label htmlFor="remarks">Remarks</label>
          <input
            type="text"
            id="remarks"
            name="remarks"
            value={finalData?.remarks || ''}
            readOnly
          />
        </div>

        {/* Right Section: Order Summary (Thinner Panel) */}
        <div className="order-summary-panel">
          <h3>Order Summary</h3>
          <hr />  {/* Horizontal line separator */}

          {/* Display the ordered products, quantities, and prices */}
          <div className="order-summary-details">
            <div><strong>QTY.</strong></div>
            <div><strong>Ordered Products</strong></div>
            <div><strong>Price</strong></div>

            {/* List each selected flower with quantity and total price */}
            {selectedFlowers?.map(flower => (
              <div key={flower.name} className="summary-item">
                <div>{flower.quantity}</div>
                <div>{flower.name}</div>
                <div>₱{flower.price * flower.quantity}</div>
              </div>
            ))}
          </div>

          {/* Separator Line */}
          <hr />

          {/* Price, Discount, and Total Amount */}
          <div className="order-summary-total">
            <p><strong>Price: </strong>₱{totalPrice}</p>
            <p><strong>Discount:</strong> ₱{discount}</p>
            <p><strong>Total Amount:</strong> ₱{finalAmount}</p>
          </div>

          {/* Proceed to Payment Button */}
          <button className="proceed-payment-button" onClick={handleProceedToPayment}>
            Save & Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillingEvents;
