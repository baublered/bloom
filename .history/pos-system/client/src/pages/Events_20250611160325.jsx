// Events.jsx
import React, { useState } from 'react';
import './Events.css';

const Events = () => {
  // Set current date
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  // Get the current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Days of the week
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month
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

  // Handle month navigation
  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
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
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
