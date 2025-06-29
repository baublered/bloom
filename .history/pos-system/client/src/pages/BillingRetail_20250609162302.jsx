import { useState } from 'react';
import './Events.css';

const Events = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(null); // To store the date clicked
  const [isFormVisible, setFormVisible] = useState(false); // To toggle form visibility
  const [eventDetails, setEventDetails] = useState({
    title: '',
    time: '',
    description: '',
  });

  // Days of the week
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get the number of days in the current month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Create calendar grid for the given month
  const createCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const calendar = [];

    // Create empty slots for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendar.push(null);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(day);
    }

    return calendar;
  };

  const calendarDays = createCalendar();

  // Handle month navigation
  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  // Handle selecting a date
  const handleDateClick = (day) => {
    setSelectedDate(day);
    setFormVisible(true); // Show the form when a date is clicked
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  // Submit form data
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic (e.g., store event details)
    console.log('Event details submitted:', eventDetails);
    setFormVisible(false); // Close the form after submission
  };

  return (
    <div className="events-page">
      <header className="events-header">
        <h1>Transaction</h1>
      </header>

      <section className="events-content">
        <div className="events-top-bar">
          <h2>Events Transaction</h2>
          <button className="add-event-btn">+ Add an Event</button>
        </div>

        <div className="calendar">
          {/* Month & Year Navigation */}
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)}>❮</button>
            <span>{`${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`}</span>
            <button onClick={() => changeMonth(1)}>❯</button>
          </div>

          {/* Days of the Week */}
          <div className="calendar-days">
            {weekdays.map((day) => (
              <div key={day} className="calendar-day">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-dates">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-date ${day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear() ? 'today' : ''}`}
                onClick={() => day && handleDateClick(day)} // Only trigger on valid days
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Form Modal */}
      {isFormVisible && (
        <div className="event-form-modal">
          <form onSubmit={handleSubmit}>
            <h3>Event on {selectedDate}:</h3>

            <label>
              Title:
              <input
                type="text"
                name="title"
                value={eventDetails.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
              />
            </label>

            <label>
              Time:
              <input
                type="time"
                name="time"
                value={eventDetails.time}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Description:
              <textarea
                name="description"
                value={eventDetails.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
              />
            </label>

            <button type="submit">Save Event</button>
            <button type="button" onClick={() => setFormVisible(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Events;
