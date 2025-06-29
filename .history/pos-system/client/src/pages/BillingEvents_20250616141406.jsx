/* Main Page Container */
.billing-page {
    display: flex;
    justify-content: center;
    padding: 2rem 1rem; /* Added horizontal padding for smaller screens */
}

.billing-container {
    width: 100%;
    max-width: 1200px;
    background-color: #ffffff;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
}

/* User Profile Header */
.user-profile-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 2rem;
}

.user-profile-dropdown {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background-color: #f0f2f5;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
}

.user-icon {
    font-size: 24px;
}

/* Page Title */
.billing-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #121212;
}

/* Main Content Layout */
.content-wrapper {
    display: flex;
    gap: 2rem;
}

/* Stepper Styles */
.stepper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-right: 2rem;
    position: relative;
    font-weight: 600;
}

.stepper-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 2; /* Ensure dots are above the line */
}

.stepper-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #ffffff;
    border: 3px solid #dbe0e6;
    margin-bottom: 8px;
}

.stepper-label {
    color: #888;
}

.stepper-item.active .stepper-dot {
    background-color: #4a47a3; /* Main active color */
    border-color: #4a47a3;
}

.stepper-item.active .stepper-label {
    color: #333;
}

.stepper-line {
    width: 2px;
    height: 120px; /* Fixed height for the line */
    background-color: #dbe0e6;
    position: absolute;
    left: calc(50% + 1rem);
    top: 10px;
    transform: translateX(-50%);
    z-index: 1; /* Behind the dots */
}

/* Main two-column content area */
.main-content {
    flex-grow: 1;
    display: grid;
    grid-template-columns: 2fr 1.2fr; /* Adjusted ratio to better match image */
    gap: 2rem;
}

/* Left & Right Panels */
.order-details,
.order-summary {
    padding: 1.5rem;
    border: 1px solid #eef0f3;
    border-radius: 12px;
}

/* Left Panel: Order Details */
.order-details h3 {
    margin-top: 0;
    font-size: 1.5rem;
}

.invoice-id {
    color: #777;
    margin-top: -1rem;
    margin-bottom: 1.5rem;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem 1.5rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
}

.detail-item label {
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 8px;
}

.detail-value {
    background-color: #f0f2f5;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 1rem;
}

.full-width {
    grid-column: span 2;
}

/* Calendar Styling */
.calendar-container .react-calendar {
    border: none;
    width: 100% !important;
    font-family: inherit;
    margin-top: 1rem;
}

.react-calendar__navigation button {
    font-weight: bold;
}

.react-calendar__tile {
    border-radius: 50%;
}

.react-calendar__tile--active,
.react-calendar__tile--active:hover,
.react-calendar__tile--active:focus {
    background-color: #4a47a3;
    color: white;
}
.react-calendar__tile--now {
    background-color: #e6e6e7;
    border-radius: 50%;
}
.react-calendar__month-view__days__day--neighboringMonth {
    color: #ccc;
}


/* Right Panel: Order Summary */
.order-summary {
    display: flex;
    flex-direction: column;
}

.order-summary h3 {
    margin-top: 0;
    font-size: 1.5rem;
}

.summary-header, .summary-item {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem 0;
}

.summary-header {
    font-weight: 600;
    color: #777;
    font-size: 0.8rem;
    border-bottom: 1px solid #eef0f3;
    margin-bottom: 0.5rem;
}

.item-name {
    font-weight: 600;
    margin: 0;
}

.item-remark {
    font-size: 0.85rem;
    color: #777;
    margin: 4px 0 0 0;
}

.align-right {
    text-align: right;
    font-weight: 600;
}

.summary-totals {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid #eef0f3;
}

.total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-weight: 500;
}

.total-row span:last-child {
  font-weight: 600;
}

.total-row.grand-total {
    font-weight: 700;
    font-size: 1.2rem;
}

.discount-details {
    text-align: right;
}

.discount-code {
    font-weight: 600;
    font-size: 0.9em;
    color: #e53935;
}

.discount-amount {
    color: #e53935;
}

/* Button */
.proceed-button {
    background-color: #5d5d5d;
    color: white;
    border: none;
    padding: 16px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
}

.proceed-button:hover {
    background-color: #333;
}