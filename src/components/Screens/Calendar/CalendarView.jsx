import { useState } from "react";

import styles from "./CalendarView.module.css";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CalendarView = ({ events = [], onDayClick, onEventClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();

  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();

  const totalDays = new Date(year, month + 1, 0).getDate();

  const blankDays = Array.from({
    length: firstDay,
  });

  const days = Array.from(
    {
      length: totalDays,
    },
    (_, index) => index + 1,
  );

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(year, month + offset, 1));
  };

  const getEventsForDay = (day) => {
    const currentDate = new Date(year, month, day);

    return events.filter((event) => {
      const eventDate = new Date(event.date);

      /*
        NORMAL EVENT
      */

      if (
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getDate() === currentDate.getDate()
      ) {
        return true;
      }

      /*
        RECURRING EVENT
      */

      if (!event.isRecurring) return false;

      if (eventDate > currentDate) return false;

      switch (event.recurrenceType) {
        case "daily":
          return true;

        case "weekly":
          return eventDate.getDay() === currentDate.getDay();

        default:
          return false;
      }
    });
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.monthNavigator}>
        <button className={styles.navButton} onClick={() => changeMonth(-1)}>
          ◀
        </button>

        <span className={styles.monthLabel}>
          {MONTHS[month]} {year}
        </span>

        <button className={styles.navButton} onClick={() => changeMonth(1)}>
          ▶
        </button>
      </div>

      <div className={styles.weekGridHeader}>
        {WEEK_DAYS.map((day) => (
          <div key={day} className={styles.weekdayLabel}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {blankDays.map((_, index) => (
          <div key={`blank-${index}`} className={styles.emptyCell} />
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForDay(day);

          const today = new Date();

          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

          return (
            <div
              key={day}
              className={`
${styles.dayCell}
${isToday ? styles.today : ""}
`}
              onClick={() => {
                if (onDayClick) onDayClick(new Date(year, month, day));
              }}
            >
              <span className={styles.dayNumber}>{day}</span>

              <div className={styles.eventStack}>
                {dayEvents.length === 0
                  ? null
                  : dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`
${styles.eventChip}
${event.isRecurring ? styles.recurringChip : ""}
`}
                        onClick={(e) => {
                          if (onEventClick) onEventClick(event, e);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className={styles.emptyMessage}>No calendar events available</div>
      )}
    </div>
  );
};

export default CalendarView;
