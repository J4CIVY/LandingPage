import React from "react";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Calendar = ({ events, currentMonth, setCurrentMonth }) => {
  // Funciones para manejar meses en UTC
  const addMonths = (date, months) => {
    const newDate = new Date(date);
    return new Date(newDate.setUTCMonth(newDate.getUTCMonth() + months));
  };

  const subMonths = (date, months) => {
    return addMonths(date, -months);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Formatear fecha en español
  const formatDateSpanish = (date) => {
    const options = { month: 'long', year: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString('es-ES', options);
  };

  // Verificar si es el mismo mes en UTC
  const isSameMonth = (date1, date2) => {
    return date1.getUTCFullYear() === date2.getUTCFullYear() && 
           date1.getUTCMonth() === date2.getUTCMonth();
  };

  // Verificar si es el mismo día en UTC
  const isSameDay = (date1, date2) => {
    return date1.getUTCFullYear() === date2.getUTCFullYear() && 
           date1.getUTCMonth() === date2.getUTCMonth() && 
           date1.getUTCDate() === date2.getUTCDate();
  };

  // Convertir fecha local a UTC sin cambiar la representación visual
  const toUTCDate = (date) => {
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ));
  };

  // Parsear fechas ISO y mantenerlas en UTC
  const parseEventDate = (dateString) => {
    const date = new Date(dateString);
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <FaArrowLeft className="text-[#000031]" />
        </button>
        <h3 className="text-xl font-bold text-[#000031]">
          {formatDateSpanish(currentMonth)}
        </h3>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <FaArrowRight className="text-[#000031]" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    
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

  const renderCells = () => {
    // Trabajar con fechas UTC consistentemente
    const monthStart = new Date(Date.UTC(
      currentMonth.getUTCFullYear(), 
      currentMonth.getUTCMonth(), 
      1
    ));
    
    const monthEnd = new Date(Date.UTC(
      currentMonth.getUTCFullYear(), 
      currentMonth.getUTCMonth() + 1, 
      0
    ));
    
    const startDate = new Date(monthStart);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());
    
    const endDate = new Date(monthEnd);
    endDate.setUTCDate(endDate.getUTCDate() + (6 - endDate.getUTCDay()));

    const rows = [];
    let days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dayEvents = events.filter(event => {
          const eventDate = parseEventDate(event.startDate);
          return isSameDay(eventDate, cloneDay);
        });

        // Convertir a fecha local solo para visualización
        const displayDate = new Date(day);
        displayDate.setMinutes(displayDate.getMinutes() + displayDate.getTimezoneOffset());

        days.push(
          <div
            className={`min-h-12 p-1 border border-gray-200 ${
              !isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-[#000031]'
            } ${isSameDay(day, toUTCDate(new Date())) ? 'bg-[#00FF99] bg-opacity-20' : ''}`}
            key={day.toISOString()}
          >
            <div className="flex flex-col h-full">
              <span className="text-sm font-medium self-end">
                {displayDate.getUTCDate()}
              </span>
              <div className="flex-1 overflow-y-auto">
                {dayEvents.map(event => (
                  <div 
                    key={event._id}
                    className="text-xs p-1 my-1 rounded bg-[#FF0000] text-white truncate"
                    title={event.name}
                  >
                    {event.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        day.setUTCDate(day.getUTCDate() + 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-4">{rows}</div>;
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