import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use `useNavigate` here
import './Events.css';

const Events = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const createCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const calendar = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendar.push(null);
    for (let day = 1; day <= daysInMonth; day++) calendar.push(day);
    return calendar;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  // Form modal and event state
  const [modal, setModal] = useState({ open: false, date: null });
  const [form, setForm] = useState({ address: '', customerName: '', phone: '', product: '', eventType: '', notes: '' });

  // React Router's useNavigate for navigation
  const navigate = useNavigate(); // Use `useNavigate` here

  // Handle input change for form fields
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission and navigation to Billing page
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Save event data (you can use localStorage or state management like Redux for this)
    localStorage.setItem('eventDetails', JSON.stringify(form));

    // Redirect to the Billing page using navigate()
    navigate('/billing'); // Use navigate instead of history.push
  };

  // Navigate to ProductSelection when the button is clicked
  const handleProductSelect = () => {
    navigate('/product-selection');
  };

  const calendarDays = createCalendar();

  return (
    <div className="events-page">
      <header className="events-header">
        <h1>Transaction</h1>
      </header>

      <section className="events-content">
        <div className="events-top-bar">
          <h2>Events Transaction</h2>
        </div>

        <div className="calendar">
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)}>❮</button>
            <span>{`${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`}</span>
            <button onClick={() => changeMonth(1)}>❯</button>
          </div>

          <div className="calendar-days">
            {weekdays.map((day) => (
              <div key={day} className="calendar-day">{day}</div>
            ))}
          </div>

          <div className="calendar-dates">
            {calendarDays.map((day, index) => {
              const dateStr = day
                ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : null;
              return (
                <div
                  key={index}
                  className={`calendar-date ${day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear() ? 'today' : ''}`}
                  onClick={() => setModal({ open: true, date: dateStr })}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal for form */}
      {modal.open && (
        <div className="event-form-modal">
          <form onSubmit={handleFormSubmit}>
            <h3>Schedule an Event</h3>

            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleInputChange}
              placeholder="Address"
              required
            />
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleInputChange}
              placeholder="Customer Name"
              required
            />
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              required
            />

            <div className="product-selection">
              <button type="button" onClick={handleProductSelect}>Select Products</button> {/* Button to navigate to ProductSelection */}
            </div>

            <select
              name="eventType"
              value={form.eventType}
              onChange={handleInputChange}
              required
            >
              <option value="">Type of Event</option>
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
            </select>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              placeholder="Notes"
            />

            <div className="form-actions">
              <button type="submit">Save & Proceed to Billing</button>
              <button type="button" className="cancel-button" onClick={() => setModal({ open: false, date: null })}>Discard</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Events;
