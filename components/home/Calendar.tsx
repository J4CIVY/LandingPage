'use client';

import React from "react";
import { Event } from '@/types/events';

// SVG inline para flechas (reemplaza react-icons)
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

// Utilidades de fecha nativas (reemplazan date-fns)
const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
};

const endOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  result.setDate(result.getDate() + diff);
  return result;
};

const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * @interface CalendarProps
 * @property {Event[]} events - An array of event objects to display on the calendar.
 * @property {Date} currentMonth - The currently displayed month in the calendar.
 * @property {React.Dispatch<React.SetStateAction<Date>>} setCurrentMonth - Function to update the current month.
 */
interface CalendarProps {
  events: Event[];
  currentMonth: Date;
  setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
}

const Calendar: React.FC<CalendarProps> = ({ events, currentMonth, setCurrentMonth }) => {
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
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  /**
   * Formats a date to a Spanish month and year string.
   * @param {Date} date - The date to format.
   * @returns {string} The formatted date string.
   */
  const formatDateSpanish = (date: Date): string => {
    return new Intl.DateTimeFormat('es-CO', {
      month: 'long',
      year: 'numeric'
    }).format(date);
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
          className="p-2 rounded-full bg-white dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-950 dark:text-white"
          aria-label="Mes anterior"
        >
          <ArrowLeftIcon />
        </button>
        <h3 className="text-xl font-bold text-slate-950 dark:text-white capitalize">
          {formatDateSpanish(currentMonth)}
        </h3>
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded-full bg-white dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-950 dark:text-white"
          aria-label="Mes siguiente"
        >
          <ArrowRightIcon />
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
          <div className="text-center font-semibold text-sm py-2 text-slate-950 dark:text-gray-300" key={i}>
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
    const startDate: Date = startOfWeek(monthStart);
    const endDate: Date = endOfWeek(monthEnd);

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
            className={`min-h-24 p-1 border border-gray-200 dark:border-gray-700 flex flex-col ${
              !isSameMonth(currentDay, monthStart) ? 'text-gray-400 bg-gray-50 dark:bg-slate-800 dark:text-gray-500' : 'text-slate-950 bg-white dark:bg-slate-900 dark:text-white'
            } ${isSameDay(currentDay, new Date()) ? 'bg-green-400 bg-opacity-20 dark:bg-green-400/30' : ''}`}
            key={currentDay.toISOString()} // Use ISO string for unique and stable key
          >
            <span className="text-sm font-medium self-end text-slate-950 dark:text-white">{currentDay.getDate()}</span>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {dayEvents.map((event: any) => (
                <div 
                  key={event._id}
                  className="text-xs p-1 my-0.5 rounded bg-red-600 dark:bg-red-700 text-white dark:text-white truncate w-full pointer-events-none"
                  title={event.name}
                >
                  {event.name}
                </div>
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
    return <div className="mb-4 border-t border-l border-gray-200 dark:border-gray-700">{rows}</div>; // Added top and left border for grid
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
