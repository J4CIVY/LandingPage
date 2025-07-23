import React from "react";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const Calendar = ({ events, currentMonth, setCurrentMonth, onEventClick }) => {
  // Function to navigate to the next month
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Function to navigate to the previous month
  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Function to format the month and year for the header
  const formatDateSpanish = (date) => {
    return format(date, 'MMMM yyyy', { locale: es });
  };

  // Render the calendar header with month navigation
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPrevMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition"
          aria-label="Mes anterior"
        >
          <FaArrowLeft className="text-slate-950" />
        </button>
        <h3 className="text-xl font-bold text-slate-950 capitalize">
          {formatDateSpanish(currentMonth)}
        </h3>
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition"
          aria-label="Mes siguiente"
        >
          <FaArrowRight className="text-slate-950" />
        </button>
      </div>
    );
  };

  // Render the day names (D, L, M, etc.)
  const renderDays = () => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']; // Full names for better readability
    
    return (
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day, i) => (
          <div className="text-center font-semibold text-sm py-2" key={i}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  // Render the calendar cells (days of the month)
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: es }); // Start week on Sunday
    const endDate = endOfWeek(monthEnd, { locale: es }); // End week on Saturday

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day; // Use a constant for the current day in the loop
        const dayEvents = events.filter(event => {
          // Ensure event.startDate is a valid ISO string before parsing
          if (!event.startDate) return false;
          const eventDate = new Date(event.startDate);
          return isSameDay(eventDate, currentDay);
        });

        days.push(
          <div
            className={`min-h-24 p-1 border border-gray-200 flex flex-col ${
              !isSameMonth(currentDay, monthStart) ? 'text-gray-400 bg-gray-50' : 'text-slate-950 bg-white'
            } ${isSameDay(currentDay, new Date()) ? 'bg-green-400 bg-opacity-20' : ''}`}
            key={currentDay.toISOString()} // Use ISO string for unique and stable key
          >
            <span className="text-sm font-medium self-end">{format(currentDay, 'd')}</span>
            <div className="flex-1 overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar class */}
              {dayEvents.map(event => (
                <button 
                  key={event._id} // Use event ID for unique key
                  className="text-xs p-1 my-0.5 rounded bg-red-600 text-white truncate w-full text-left"
                  title={event.name}
                  onClick={() => onEventClick(event)} // Pass event to handler
                  aria-label={`Ver detalles del evento ${event.name}`}
                >
                  {event.name}
                </button>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1); // Move to the next day
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toISOString()}> {/* Use ISO string for row key */}
          {days}
        </div>
      );
      days = []; // Reset days array for the next week
    }
    return <div className="mb-4 border-t border-l border-gray-200">{rows}</div>; // Added top and left border for grid
  };

  return (
    <div className="calendar-container">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;