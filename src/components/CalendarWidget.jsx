import { useState } from 'react';

export default function CalendarWidget({ product, selectedDate, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to change month
  const changeMonth = (offset) => {
    let nextMonth = currentMonth + offset;
    let nextYear = currentYear;

    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    } else if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }

    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];

    // Empty cells before the 1st of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ type: 'empty', key: `empty-${i}` });
    }

    // Actual day cells
    for (let day = 1; day <= totalDays; day++) {
      const monthFormatted = String(currentMonth + 1).padStart(2, '0');
      const dayFormatted = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;
      const isBooked = product.bookedDates.includes(dateStr);

      days.push({
        type: 'day',
        dayNum: day,
        dateStr,
        isBooked,
        key: `day-${day}`
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="calendar-section">
      <div className="calendar-title-row">
        <span className="calendar-title">Select Event Date</span>
        <div className="calendar-legend">
          <span className="legend-item"><span className="legend-dot avail"></span> Available</span>
          <span className="legend-item"><span className="legend-dot booked"></span> Booked</span>
        </div>
      </div>

      <div className="calendar-box">
        <div className="cal-header">
          <span className="cal-month-nav" onClick={() => changeMonth(-1)} style={{ cursor: 'pointer', userSelect: 'none' }}>&lt;</span>
          <span className="cal-month-label" id="calendar-month-year-lbl">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <span className="cal-month-nav" onClick={() => changeMonth(1)} style={{ cursor: 'pointer', userSelect: 'none' }}>&gt;</span>
        </div>
        <div className="cal-weekdays">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div className="cal-days" id="calendar-days-grid">
          {calendarDays.map((item) => {
            if (item.type === 'empty') {
              return <div key={item.key} className="cal-day empty"></div>;
            }

            const isSelected = selectedDate === item.dateStr;

            return (
              <div
                key={item.key}
                className={`cal-day ${item.isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  if (!item.isBooked) {
                    onSelectDate(item.dateStr);
                  }
                }}
                style={{ cursor: item.isBooked ? 'not-allowed' : 'pointer' }}
              >
                {item.dayNum}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
