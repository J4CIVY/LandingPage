import React from "react";
import { format, parseISO, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Calendar = ({ events, currentMonth, setCurrentMonth }) => {
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
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
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
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
    const dateFormat = 'EEEE';
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-semibold text-sm py-2" key={i}>
          {format(new Date(startDate.setDate(i + 1)), dateFormat, { locale: es }).charAt(0).toUpperCase()}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
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
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = new Date(day);
        const dayEvents = events.filter(event => 
          isSameDay(parseISO(event.startDate), day)
        );

        days.push(
          <div
            className={`min-h-12 p-1 border border-gray-200 ${
              !isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-[#000031]'
            } ${isSameDay(day, new Date()) ? 'bg-[#00FF99] bg-opacity-20' : ''}`}
            key={day}
          >
            <div className="flex flex-col h-full">
              <span className="text-sm font-medium self-end">{formattedDate}</span>
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
        day = new Date(day.setDate(day.getDate() + 1));
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
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