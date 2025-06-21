import React from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay,
  parseISO,
  addDays,
  getTimezoneOffset,
  getDate,
  getMonth,
  getYear
} from 'date-fns';
import { es } from 'date-fns/locale';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Calendar = ({ events, currentMonth, setCurrentMonth }) => {
  // Ajustar fecha UTC a hora local de Colombia (UTC-5)
  const adjustToColombiaTime = (dateString) => {
    if (!dateString) return new Date();
    
    const date = parseISO(dateString);
    // Colombia está en UTC-5 (300 minutos)
    const colombiaOffset = -300;
    const currentOffset = getTimezoneOffset(date);
    const diff = currentOffset - colombiaOffset;
    
    return new Date(date.getTime() + diff * 60 * 1000);
  };

  // Navegación entre meses
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Comparación de días ajustada para Colombia
  const isSameDayColombia = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return getYear(d1) === getYear(d2) && 
           getMonth(d1) === getMonth(d2) && 
           getDate(d1) === getDate(d2);
  };

  // Renderizar encabezado
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

  // Renderizar días de la semana
  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEE';
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div className="text-center font-semibold text-sm py-2" key={i}>
          {format(day, dateFormat, { locale: es }).charAt(0).toUpperCase()}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  // Renderizar celdas del calendario
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = new Date(day);
        
        // Filtrar eventos para este día (ajustados a hora Colombia)
        const dayEvents = events.filter(event => {
          const eventDate = adjustToColombiaTime(event.startDate);
          return isSameDayColombia(eventDate, cloneDay);
        });

        days.push(
          <div
            className={`min-h-12 p-1 border border-gray-200 ${
              !isSameMonth(day, monthStart) ? 'text-gray-400' : 'text-[#000031]'
            } ${isSameDay(day, new Date()) ? 'bg-[#00FF99] bg-opacity-20' : ''}`}
            key={day.toString()}
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
        day = addDays(day, 1);
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