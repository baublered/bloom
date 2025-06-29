import { useEffect, useState } from 'react';
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

  const [events, setEvents] = useState([
    // Sample event for demonstration
    { id: 1, date: '2025-06-20', customerName: 'Sample Wedding', eventType: 'Wedding', address: 'Sample Address', phone: '12345', notes: 'Sample notes' }
  ]);

  // State for the "Add Event" form modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  // --- NEW: State for the "Event List" modal ---
  const [isEventListModalOpen, setIsEventListModalOpen] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(null);
  // --- NEW: State to hold events for the selected date ---
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);

  const [form, setForm] = useState({ address: '', customerName: '', phone: '', eventType: '', notes: '' });

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

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

  // --- UPDATED: Main click handler for dates ---
  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const eventsOnDate = events.filter(event => event.date === dateStr);
    
    setSelectedDate(dateStr);

    if (eventsOnDate.length > 0) {
      // If there are events, show the event list modal
      setEventsForSelectedDate(eventsOnDate);
      setIsEventListModalOpen(true);
    } else {
      // If the date is empty, open the form to add a new event
      setIsFormModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newEvent = { id: Date.now(), date: selectedDate, ...form };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));

    setForm({ address: '', customerName: '', phone: '', eventType: '', notes: '' });
    setIsFormModalOpen(false);

    // After saving, go to billing for the NEW event
    navigate('/billing-events', { state: { eventDetails: newEvent } });
  };
  
  // --- NEW: Function to open the add form from the list modal ---
  const handleAddEventFromList = () => {
    setIsEventListModalOpen(false); // Close the list modal
    setIsFormModalOpen(true);     // Open the form modal
  };

  // --- NEW: Function to navigate to billing for an EXISTING event ---
  const handleViewEventDetails = (event) => {
    console.log("Viewing event:", event);
    navigate('/billing-events', { state: { eventDetails: event } });
  }

  return (
    <div className="events-layout">
      <Sidebar />
      <main className="main-content">
        <UserProfileHeader />
        <div className="page-title">Transaction</div>
        <div className="content-card">
          <div className="card-header">
            <h2>Events Transaction</h2>
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
                {weekdays.map((day) => <div key={day} className="weekday-cell">{day}</div>)}
              </div>
              <div className="calendar-dates">
                {calendarDays.map((day, index) => {
                  const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                  const eventsForDay = events.filter(event => event.date === dateStr);
                  return (
                    <div key={index} className={`date-cell ${day ? 'clickable' : ''}`} onClick={() => handleDateClick(day)}>
                      {day && <span className="date-number">{day}</span>}
                      <div className="events-list">
                        {eventsForDay.map(event => (
                          <div key={event.id} className="event-item">{event.customerName}</div>
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

      {/* --- "Add Event" Form Modal (No major changes here) --- */}
      {isFormModalOpen && (
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
              <button type="submit">Save & Proceed to Product Selection</button>
              <button type="button" className="cancel-button" onClick={() => setIsFormModalOpen(false)}>Discard</button>
            </div>
          </form>
        </div>
      )}

      {/* --- NEW: "Event List" Modal --- */}
      {isEventListModalOpen && (
        <div className="event-form-modal"> {/* Reusing the modal background style */}
          <div className="modal-form event-list-modal"> {/* Reusing the form container style */}
            <h3>Events for {selectedDate}</h3>
            <div className="event-list-container">
              {eventsForSelectedDate.map(event => (
                <div key={event.id} className="event-list-item">
                  <span className="event-list-name">{event.customerName} ({event.eventType})</span>
                  <button className="view-details-button" onClick={() => handleViewEventDetails(event)}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
            <div className="form-actions">
                <button type="button" onClick={handleAddEventFromList}>Add New Event</button>
                <button type="button" className="cancel-button" onClick={() => setIsEventListModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
