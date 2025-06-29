import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Events.css';

// --- Placeholder Components for Layout ---
// In a real app, these would be in separate files.

const Sidebar = () => (
  <div className="sidebar">
    <div className="sidebar-header">BLOOMTRACK</div>
    <nav className="sidebar-nav">
      <a href="#">Dashboard</a>
      <a href="#">Product Registration</a>
      <a href="#">User Registration</a>
      <div className="nav-group active">
        <a href="#" className="nav-group-title">Transactions</a>
        <div className="nav-submenu">
          <a href="#">Retail</a>
          <a href="#" className="active-link">Events</a>
        </div>
      </div>
      <a href="#">Reports</a>
      <a href="#">Inventory</a>
      <a href="#">Maintenance</a>
    </nav>
    <div className="sidebar-footer">
      <span>?</span>
      <span>&#x24D8;</span>
    </div>
  </div>
);

const UserProfileHeader = () => (
  <header className="user-profile-header">
    <div className="user-profile-dropdown">
      <span className="user-icon">&#x1F464;</span>
      <span>User Profile</span>
      <span className="dropdown-arrow">▼</span>
    </div>
  </header>
);

// --- Main Events Component ---

const Events = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const navigate = useNavigate();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // --- State for Modal and Form ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ address: '', customerName: '', phone: '', eventType: '', notes: '' });

  // --- Calendar Logic ---
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

  const calendarDays = createCalendar();

  // --- Form Handling ---
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('eventDetails', JSON.stringify(form));
    setIsModalOpen(false); // Close modal on submit
    navigate('/product-selection');
  };

  return (
    <div className="events-layout">
      <Sidebar />
      <main className="main-content">
        <UserProfileHeader />
        <div className="page-title">Transaction</div>

        <div className="content-card">
          <div className="card-header">
            <h2>Events Transaction</h2>
            <button className="add-event-button" onClick={() => setIsModalOpen(true)}>
              <span className="plus-icon">+</span> Add an Event
            </button>
          </div>

          <div className="calendar-container">
            <div className="calendar-header">
              <button className="month-nav" onClick={() => changeMonth(-1)}>❮</button>
              <div className="month-display">
                <span className="month-name">{currentDate.toLocaleString('default', { month: 'long' })}</span>
                <span className="year-name">{currentYear}</span>
              </div>
              <button className="month-nav" onClick={() => changeMonth(1)}>❯</button>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {weekdays.map((day) => (
                  <div key={day} className="weekday-cell">{day}</div>
                ))}
              </div>
              <div className="calendar-dates">
                {calendarDays.map((day, index) => (
                  <div key={index} className="date-cell">
                    {day && <span className="date-number">{day}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Event Form Modal --- */}
      {isModalOpen && (
        <div className="event-form-modal">
          <form className="modal-form" onSubmit={handleFormSubmit}>
            <h3>Schedule an Event</h3>
            <input type="text" name="address" value={form.address} onChange={handleInputChange} placeholder="Address" required />
            <input type="text" name="customerName" value={form.customerName} onChange={handleInputChange} placeholder="Customer Name" required />
            <input type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Phone Number" required />
            <select name="eventType" value={form.eventType} onChange={handleInputChange} required>
              <option value="">Type of Event</option>
              <option value="Wedding">Wedding</option>
              <option value="Debut">Debut</option>
            </select>
            <textarea name="notes" value={form.notes} onChange={handleInputChange} placeholder="Notes" />
            <div className="form-actions">
              <button type="submit">Save & Proceed</button>
              <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>Discard</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Events;