import React from "react";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Calendar = ({ events, currentMonth, setCurrentMonth }) => {
  // Funciones para manejar meses
  const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
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
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  // Verificar si es el mismo mes
  const isSameMonth = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() && 
           date1.getMonth() === date2.getMonth();
  };

  // Verificar si es el mismo día (ajustado para zona horaria de Colombia)
  const isSameDay = (date1, date2) => {
    // Ajustamos ambas fechas a la zona horaria de Colombia
    const adjustToColombiaTime = (date) => {
      const colombiaOffset = -5 * 60; // UTC-5 para Colombia
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      return new Date(utc + (colombiaOffset * 60000));
    };

    const colDate1 = adjustToColombiaTime(date1);
    const colDate2 = adjustToColombiaTime(date2);

    return colDate1.getFullYear() === colDate2.getFullYear() && 
           colDate1.getMonth() === colDate2.getMonth() && 
           colDate1.getDate() === colDate2.getDate();
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
    const days = [];
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // Días de la semana en español
    
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
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const rows = [];
    let days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.startDate);
          return isSameDay(eventDate, day);
        });

        days.push(
          <div
            className={`min-h-12 p-1 border border-gray-200 ${
              !isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-[#000031]'
            } ${isSameDay(day, new Date()) ? 'bg-[#00FF99] bg-opacity-20' : ''}`}
            key={day.toString()}
          >
            <div className="flex flex-col h-full">
              <span className="text-sm font-medium self-end">{day.getDate()}</span>
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
        day.setDate(day.getDate() + 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
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