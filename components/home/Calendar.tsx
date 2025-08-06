'use client';

import React from "react";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Event } from '@/types/events'; // Import the Event interface

/**
 * @interface CalendarProps
 * @property {Event[]} events - An array of event objects to display on the calendar.
 * @property {Date} currentMonth - The currently displayed month in the calendar.
 * @property {React.Dispatch<React.SetStateAction<Date>>} setCurrentMonth - Function to update the current month.
 * @property {(event: Event) => void} onEventClick - Callback function when an event on the calendar is clicked.
 */
interface CalendarProps {
  events: Event[];
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
  onEventClick: (event: Event) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, currentMonth, setCurrentMonth, onEventClick }) => {
  /**
   * Navigates to the next month in the calendar.
   */
  const goToNextMonth = (): void => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  /**
   * Navigates to the previous month in the calendar.
   */
  const goToPrevMonth = (): void => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  /**
   * Formats a date to a Spanish month and year string.
   * @param {Date} date - The date to format.
   * @returns {string} The formatted date string.
   */
  const formatDateSpanish = (date: Date): string => {
    return format(date, 'MMMM yyyy', { locale: es });
  };

  /**
   * Renders the calendar header with month navigation buttons.
   * @returns {JSX.Element} The header JSX.
   */
  const renderHeader = (): JSX.Element => {
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

  /**
   * Renders the day names (e.g., Dom, Lun, Mar).
   * @returns {JSX.Element} The day names JSX.
   */
  const renderDays = (): JSX.Element => {
    const dayNames: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
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

  /**
   * Renders the calendar cells (days of the month) with events.
   * @returns {JSX.Element} The calendar cells JSX.
   */
  const renderCells = (): JSX.Element => {
    const monthStart: Date = startOfMonth(currentMonth);
    const monthEnd: Date = endOfMonth(currentMonth);
    const startDate: Date = startOfWeek(monthStart, { locale: es });
    const endDate: Date = endOfWeek(monthEnd, { locale: es });

    const rows: JSX.Element[] = [];
    let days: JSX.Element[] = [];
    let day: Date = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay: Date = day;
        const dayEvents: Event[] = events.filter((event: any) => {
          // Ensure event.startDate is a valid ISO string before parsing
          if (!event.startDate) return false;
          const eventDate: Date = new Date(event.startDate);
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
              {dayEvents.map((event: any) => (
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
