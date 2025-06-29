import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BillingEvents.css';

function BillingEvents() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve the selected flowers and form data from the previous page
  const { selectedFlowers, finalData } = location.state || {};

  // Initialize state for the customer form details
  const [customerName, setCustomerName] = useState(finalData?.customerName || '');
  const [eventDate, setEventDate] = useState(finalData?.date || '');  // To be handled by calendar picker
  const [eventAddress, setEventAddress] = useState(finalData?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(finalData?.phone || '');
  const [productsOrdered, setProductsOrdered] = useState(finalData?.products || '');
  const [remarks, setRemarks] = useState(finalData?.remarks || '');

  // Handle input changes for the text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numerical input for the phone number
      if (/^\d*$/.test(value)) {
        setPhoneNumber(value);
      }
    } else {
      // Update other fields
      switch (name) {
        case 'customerName':
          setCustomerName(value);
          break;
        case 'eventAddress':
          setEventAddress(value);
          break;
        case 'productsOrdered':
          setProductsOrdered(value);
          break;
        case 'remarks':
          setRemarks(value);
          break;
        case 'eventDate':
          setEventDate(value);
          break;
        default:
          break;
      }
    }
  };

  // Handle save and proceed to payment
  const handleProceedToPayment = () => {
    const finalOrderDetails = {
      customerName,
      eventDate,
      eventAddress,
      phoneNumber,
      productsOrdered,
      remarks,
      selectedFlowers,  // Add the selected flowers here as well
    };

    console.log('Final Order Details:', finalOrderDetails);
    // Proceed to payment or other actions
    navigate('/payment'); // You can redirect to the payment page
  };

  return (
    <div className="billing-events-container">
      <div className="billing-events-header">
        <h2>Billing for Events</h2>
      </div>

      <div className="billing-events-content">
        {/* Left Section: Order Details */}
        <div className="order-details">
          <h3>Order Details</h3>
          
          <label htmlFor="customerName">Customer Name</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={customerName}
            onChange={handleInputChange}
            placeholder="Enter Customer Name"
            required
          />

          <label htmlFor="eventDate">Date</label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={eventDate}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="eventAddress">Events Address</label>
          <input
            type="text"
            id="eventAddress"
            name="eventAddress"
            value={eventAddress}
            onChange={handleInputChange}
            placeholder="Enter Address"
            required
          />

          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            id="phoneNumber"
            name="phone"
            value={phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter Phone Number"
            required
          />

          <label htmlFor="productsOrdered">Products/Bundles Ordered</label>
          <input
            type="text"
            id="productsOrdered"
            name="productsOrdered"
            value={productsOrdered}
            onChange={handleInputChange}
            placeholder="Enter Products Ordered"
            required
          />

          <label htmlFor="remarks">Remarks</label>
          <input
            type="text"
            id="remarks"
            name="remarks"
            value={remarks}
            onChange={handleInputChange}
            placeholder="Enter Remarks"
            required
          />
        </div>

        {/* Right Section: Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-summary-details">
            <div>
              <p><strong>QTY.</strong></p>
            </div>
            <div>
              <p><strong>Ordered Products</strong></p>
            </div>
            <div>
              <p><strong>Price</strong></p>
            </div>

            {/* List each product with quantity and price */}
            {selectedFlowers?.map(flower => (
              <div key={flower.name} className="summary-item">
                <p>{flower.quantity}</p>
                <p>{flower.name}</p>
                <p>₱{flower.price * flower.quantity}</p>
              </div>
            ))}
          </div>

          <div className="order-summary-total">
            <p><strong>Price: </strong>₱{selectedFlowers?.reduce((acc, flower) => acc + (flower.price * flower.quantity), 0)}</p>
            <p><strong>Discount:</strong> ₱100.00</p>
            <p><strong>Total Amount:</strong> ₱{selectedFlowers?.reduce((acc, flower) => acc + (flower.price * flower.quantity), 0) - 100}</p>
          </div>

          <button className="proceed-payment-button" onClick={handleProceedToPayment}>
            Save & Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillingEvents;
