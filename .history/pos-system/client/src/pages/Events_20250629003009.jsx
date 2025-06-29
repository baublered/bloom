import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Events.css';
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';

// --- Event Popover Component ---
const EventPopover = ({ events, position, onClose, onView, onCancel }) => {
    const popoverRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="event-popover" ref={popoverRef} style={{ top: position.y, left: position.x }}>
            <div className="popover-header">
                Schedule for: {new Date(events[0].eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="popover-content">
                {events.map(event => (
                    <div key={event._id} className="popover-event-item">
                        <span className="event-name">{event.customerName}</span>
                        <div className="popover-actions">
                            <button className="popover-btn view" onClick={() => onView(event)}>View Details</button>
                            <button className="popover-btn cancel" onClick={() => onCancel(event)}>Cancel Event</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main Events Component ---
const Events = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [popover, setPopover] = useState({ visible: false, x: 0, y: 0, events: [] });
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ customerName: '', address: '', phone: '', eventType: '', notes: '' });

  // --- NEW: State for the cancel confirmation modal ---
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);

  // Add this to your existing state variables
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);

  const fetchEvents = async () => {
    try {
        setLoading(true);
        const response = await axios.get('/api/events');
        setEvents(response.data);
    } catch (err) {
        setError('Failed to load events.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleDateClick = (day, e) => {
    if (!day) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const eventsOnDate = events.filter(event => new Date(event.eventDate).toISOString().startsWith(dateStr));
    
    setSelectedDate(dateStr);

    if (eventsOnDate.length > 0) {
      const rect = e.target.getBoundingClientRect();
      setPopover({
          visible: true,
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 5,
          events: eventsOnDate
      });
    } else {
      setForm({ customerName: '', address: '', phone: '', eventType: '', notes: '' });
      setIsFormModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        const eventData = { ...form, eventDate: selectedDate };
        const response = await axios.post('/api/events/create', eventData);
        if (response.data.success) {
            fetchEvents();
            setIsFormModalOpen(false);
            navigate('/product-selection', { state: { eventDetails: response.data.event } });
        }
    } catch (err) {
        alert("Could not create event. Please try again.");
    }
  };

  const handleViewEventDetails = (event) => {
    setPopover({ visible: false });
    
    // If the event is Pending (orange), show the details popup
    if (event.status === 'Pending') {
      setSelectedEventDetails(event);
      setIsDetailsModalOpen(true);
    } 
    // If Fully Paid, go to receipt
    else if (event.status === 'Fully Paid') {
      navigate('/receipt', { state: { orderSummary: event.products, grandTotal: event.totalAmount, ...event } });
    } 
    // If not fully paid, go to payment page
    else {
      navigate('/events-payment', { 
        state: { 
          eventDetails: event, 
          orderSummary: event.products || [],
          subtotal: event.subtotal || 0,
          discountAmount: event.discountAmount || 0,
          grandTotal: event.totalAmount || 0,
        } 
      });
    }
  }

  // --- UPDATED: This now opens the confirmation modal ---
  const handleCancelEvent = (event) => {
    setEventToCancel(event);
    setIsCancelModalOpen(true);
  };

  // --- NEW: This function runs when "YES" is clicked in the cancel modal ---
  const confirmCancelEvent = async () => {
    console.log('YES button clicked'); // Add this line
    try {
      const response = await fetch(`/api/events/${eventToCancel._id}/cancel`, {
        method: 'PUT', // or PATCH, depending on your backend
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        // Update the event in your local state
        setEvents(events =>
          events.map(ev =>
            ev._id === eventToCancel._id ? { ...ev, status: 'Cancelled' } : ev
          )
        );
        setIsCancelModalOpen(false);
      } else {
        // handle error
      }
    } catch (err) {
      // handle error
    }
  };

  const getEventStatusClass = (status) => {
      switch(status) {
          case 'Fully Paid': return 'status-green';
          case 'Pending': return 'status-orange';
          case 'Cancelled': return 'status-red';
          default: return 'status-default';
      }
  }

  return (
    <div className="events-layout">
      <Sidebar />
      <main className="main-content">
        <header className="user-profile-header"><UserProfile /></header>
        <div className="page-title">Transaction</div>
        <div className="content-card">
          <div className="card-header">
            <h2>Events Transaction</h2>
            <button className="add-event-button" onClick={(e) => handleDateClick(new Date().getDate(), e)}>
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
            {loading && <p>Loading events...</p>}
            {error && <p className="error-message">{error}</p>}
            <div className="calendar-grid">
              <div className="calendar-weekdays">{weekdays.map((day) => <div key={day} className="weekday-cell">{day}</div>)}</div>
              <div className="calendar-dates">
                {calendarDays.map((day, index) => {
                  const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                  const eventsForDay = events.filter(event => event.eventDate && new Date(event.eventDate).toISOString().startsWith(dateStr));
                  return (
                    <div key={index} className={`date-cell ${day ? 'clickable' : ''}`} onClick={(e) => handleDateClick(day, e)}>
                      {day && <span className="date-number">{day}</span>}
                      <div className="events-list">
                        {eventsForDay.map(event => (
                          <div key={event._id} className={`event-item ${getEventStatusClass(event.status)}`}>
                            {event.eventType} - {event.customerName}
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
            <textarea name="notes" value={form.notes} onChange={handleInputChange} placeholder="Notes" />
            <div className="form-actions">
              <button type="submit">Save & Proceed</button>
              <button type="button" className="cancel-button" onClick={() => setIsFormModalOpen(false)}>Discard</button>
            </div>
          </form>
        </div>
      )}

      {popover.visible && (
        <EventPopover
          events={popover.events}
          position={popover}
          onClose={() => setPopover({ visible: false })}
          onView={handleViewEventDetails}
          onCancel={handleCancelEvent}
        />
      )}

      {/* --- Cancel Confirmation Modal --- */}
      {isCancelModalOpen && (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal cancel-confirmation">
                <p>Are you sure you want to cancel this event?</p>
                <div className="modal-actions">
                    <button className="modal-btn no" type="button" onClick={() => setIsCancelModalOpen(false)}>No</button>
                    <button className="modal-btn yes-cancel" type="button" onClick={confirmCancelEvent}>YES</button>
                </div>
            </div>
        </div>
      )}

      {isDetailsModalOpen && selectedEventDetails && (
        <div className="event-details-modal-overlay">
          <div className="event-details-modal">
            <div className="details-header">
              <h3>Schedule for: {new Date(selectedEventDetails.eventDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</h3>
              <div className="event-type-badge">{selectedEventDetails.eventType} - {selectedEventDetails.customerName}</div>
              <div className="balance-info">BALANCE: ₱{selectedEventDetails.remainingBalance || 0}</div>
            </div>
            
            <div className="details-content">
              <div className="detail-row">
                <span className="detail-label">Customer Name:</span>
                <span className="detail-value">{selectedEventDetails.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedEventDetails.address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">{selectedEventDetails.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Event:</span>
                <span className="detail-value">{selectedEventDetails.eventType}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount of Down Payment:</span>
                <span className="detail-value">₱{selectedEventDetails.downPayment || 0}</span>
              </div>
            </div>
            
            <div className="details-actions">
              <button 
                className="back-btn" 
                onClick={() => setIsDetailsModalOpen(false)}
              >
                ← Back
              </button>
              <button 
                className="pay-btn" 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  navigate('/events-payment', { 
                    state: { 
                      eventDetails: selectedEventDetails, 
                      orderSummary: selectedEventDetails.products || [],
                      subtotal: selectedEventDetails.subtotal || 0,
                      discountAmount: selectedEventDetails.discountAmount || 0,
                      grandTotal: selectedEventDetails.totalAmount || 0,
                    } 
                  });
                }}
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
const getEventStatusClass = (status) => {
    switch(status) {
        case 'Fully Paid': return 'status-green';
        case 'Pending': return 'status-orange';
        case 'Cancelled': return 'status-red';
        default: return 'status-default';
    }
}