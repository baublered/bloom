import { useEffect, useState } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import './Events.css';

// --- Placeholder Components for Layout (No changes here) ---
const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">BLOOMTRACK</div>
      <nav className="sidebar-nav">
        <a href="/dashboard">Dashboard</a>
        <a href="/product-registration">Product Registration</a>
        <a href="/user-registration">User Registration</a>
        <div className="nav-group active">
          <a href="/transactions" className="nav-group-title">Transactions</a>
          <div className="nav-submenu">
            <a href="/transactions/retail">Retail</a>
            <a href="/transactions/events" className="active-link">Events</a>
          </div>
        </div>
        <a href="/reports">Reports</a>
        <a href="/inventory">Inventory</a>
        <a href="/maintenance">Maintenance</a>
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

  // --- NEW: State for managing events and the modal ---
  const [events, setEvents] = useState([
    // Adding a sample event so you can see the styling immediately
    { id: 1, date: '2025-06-20', customerName: 'Sample Wedding', eventType: 'Wedding' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // To store which date was clicked
  const [form, setForm] = useState({ address: '', customerName: '', phone: '', eventType: '', notes: '' });

  // --- NEW: Load events from localStorage when the component loads ---
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []); // The empty array [] means this effect runs only once on mount

  // --- Calendar Logic (No changes here) ---
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
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

  // --- UPDATED: Form and Event Handling ---
  const handleDateClick = (day) => {
    if (!day) return; // Ignore clicks on empty cells
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleFormSubmit = (e) => {
  e.preventDefault();
  const newEvent = {
    id: Date.now(), // Unique ID for the event
    date: selectedDate, // The date that was clicked
    ...form, // The rest of the form data
  };

  // Add the new event to the existing list
  const updatedEvents = [...events, newEvent];
  setEvents(updatedEvents);

  // Save the updated list to localStorage
  localStorage.setItem('events', JSON.stringify(updatedEvents));

  // Reset form and close modal
  setForm({ address: '', customerName: '', phone: '', eventType: '', notes: '' });
  setIsModalOpen(false);

  // Navigate to the ProductSelection page
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
            <button className="add-event-button" onClick={() => handleDateClick(new Date().getDate())}>
              <span className="plus-icon">+</span> Add Event for Today
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
                {calendarDays.map((day, index) => {
                  // Find events for this specific day
                  const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                  const eventsForDay = events.filter(event => event.date === dateStr);

                  return (
                    <div key={index} className={`date-cell ${day ? 'clickable' : ''}`} onClick={() => handleDateClick(day)}>
                      {day && <span className="date-number">{day}</span>}
                      <div className="events-list">
                        {eventsForDay.map(event => (
                          <div key={event.id} className="event-item">
                            {event.customerName}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Event Form Modal --- */}
      {isModalOpen && (
        <div className="event-form-modal">
          <form className="modal-form" onSubmit={handleFormSubmit}>
            <h3>Schedule for {selectedDate}</h3>
            <input type="text" name="customerName" value={form.customerName} onChange={handleInputChange} placeholder="Customer Name or Event Title" required />
            <input type="text" name="address" value={form.address} onChange={handleInputChange} placeholder="Address" required />
            <input type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Phone Number" required />
            <select name="eventType" value={form.eventType} onChange={handleInputChange} required>
              <option value="">Type of Event</option>
              <option value="Wedding">Wedding</option>
              <option value="Debut">Debut</option>
              <option value="Birthday">Birthday</option>
              <option value="Other">Other</option>
            </select>
            <textarea name="notes" value={form.notes} onChange={handleInputChange} placeholder="Notes" />
            <div className="form-actions">
              <button type="submit">Save Event</button>
              <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>Discard</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Events;