import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Events.css';

// --- Placeholder Components for Layout (Can be replaced with your actual components) ---
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

  // --- UPDATED: State is now fetched from the database ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEventListModalOpen, setIsEventListModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);
  
  // Updated form state to include downPayment
  const [form, setForm] = useState({ 
      customerName: '', 
      address: '', 
      phone: '', 
      eventType: '', 
      notes: '',
      downPayment: '',
  });

  // --- NEW: Function to fetch events from the backend ---
  const fetchEvents = async () => {
    try {
        setLoading(true);
        const response = await axios.get('/api/events');
        setEvents(response.data);
    } catch (err) {
        setError('Failed to load events.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // Fetch events when the component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Calendar logic (no changes)
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

  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const eventsOnDate = events.filter(event => new Date(event.eventDate).toISOString().startsWith(dateStr));
    
    setSelectedDate(dateStr);

    if (eventsOnDate.length > 0) {
      setEventsForSelectedDate(eventsOnDate);
      setIsEventListModalOpen(true);
    } else {
      setIsFormModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- UPDATED: Form submission now calls the backend API ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        const eventData = { ...form, eventDate: selectedDate };
        const response = await axios.post('/api/events/create', eventData);

        if (response.data.success) {
            fetchEvents(); // Refresh the events from the server
            setIsFormModalOpen(false);
            // Navigate to product selection for the newly created event
            navigate('/product-selection', { state: { eventDetails: response.data.event } });
        }
    } catch (err) {
        console.error("Failed to create event:", err);
        alert("Could not create event. Please try again.");
    }
  };
  
  const handleAddEventFromList = () => {
    setIsEventListModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleViewEventDetails = (event) => {
    navigate('/product-selection', { state: { eventDetails: event } });
  }

  // --- UPDATED: Remove event now calls the backend API ---
  const handleRemoveEvent = async (eventIdToRemove) => {
    if (window.confirm("Are you sure you want to remove this event? This action cannot be undone.")) {
        try {
            await axios.delete(`/api/events/${eventIdToRemove}`);
            fetchEvents(); // Refresh the events list
            setIsEventListModalOpen(false);
        } catch (err) {
            console.error("Failed to delete event:", err);
            alert("Could not delete event. Please try again.");
        }
    }
  };

  // --- NEW: Helper function to get the CSS class for event status ---
  const getEventStatusClass = (status) => {
      switch(status) {
          case 'Fully Paid': return 'status-green';
          case 'Pending': return 'status-orange';
          case 'Cancelled': return 'status-red';
          default: return '';
      }
  }

  return (
    <div className="events-layout">
      <Sidebar />
      <main className="main-content">
        <UserProfileHeader />
        <div className="page-title">Transaction</div>
        <div className="content-card">
          <div className="card-header"><h2>Events Transaction</h2></div>
          <div className="calendar-container">
            <div className="calendar-header">
                <button className="month-nav" onClick={() => changeMonth(-1)}>❮</button>
                <div className="month-display">
                    <span className="month-name">{currentDate.toLocaleString('default', { month: 'long' })}</span>
                    <span className="year-name">{currentYear}</span>
                </div>
                <button className="month-nav" onClick={() => changeMonth(1)}>❯</button>
            </div>
            {loading && <p>Loading events...</p>}
            {error && <p className="error-message">{error}</p>}
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {weekdays.map((day) => <div key={day} className="weekday-cell">{day}</div>)}
              </div>
              <div className="calendar-dates">
                {calendarDays.map((day, index) => {
                  const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                  const eventsForDay = events.filter(event => event.eventDate && new Date(event.eventDate).toISOString().startsWith(dateStr));
                  return (
                    <div key={index} className={`date-cell ${day ? 'clickable' : ''}`} onClick={() => handleDateClick(day)}>
                      {day && <span className="date-number">{day}</span>}
                      <div className="events-list">
                        {eventsForDay.map(event => (
                          <div key={event._id} className={`event-item ${getEventStatusClass(event.status)}`}>
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

      {isFormModalOpen && (
        <div className="event-form-modal">
          <form className="modal-form" onSubmit={handleFormSubmit}>
            <h3>Schedule for {selectedDate}</h3>
            <input type="text" name="customerName" value={form.customerName} onChange={handleInputChange} placeholder="Customer Name" required />
            <input type="text" name="address" value={form.address} onChange={handleInputChange} placeholder="Address" required />
            <input type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Phone Number" required />
            <select name="eventType" value={form.eventType} onChange={handleInputChange} required>
              <option value="">Type of Event</option>
              <option value="Wedding">Wedding</option><option value="Debut">Debut</option><option value="Birthday">Birthday</option><option value="Other">Other</option>
            </select>
            {/* --- NEW: Down Payment Input --- */}
            <input type="number" name="downPayment" value={form.downPayment} onChange={handleInputChange} placeholder="Down Payment (optional)" />
            <textarea name="notes" value={form.notes} onChange={handleInputChange} placeholder="Notes" />
            <div className="form-actions">
              <button type="submit">Save & Proceed to Products</button>
              <button type="button" className="cancel-button" onClick={() => setIsFormModalOpen(false)}>Discard</button>
            </div>
          </form>
        </div>
      )}

      {isEventListModalOpen && (
        <div className="event-form-modal">
          <div className="modal-form event-list-modal">
            <h3>Events for {selectedDate}</h3>
            <div className="event-list-container">
              {eventsForSelectedDate.map(event => (
                <div key={event._id} className="event-list-item">
                  <span className="event-list-name">{event.customerName} ({event.eventType})</span>
                  <div className="event-list-actions">
                    <button className="view-details-button" onClick={() => handleViewEventDetails(event)}>View</button>
                    <button className="remove-event-button" onClick={() => handleRemoveEvent(event._id)}>Remove</button>
                  </div>
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
