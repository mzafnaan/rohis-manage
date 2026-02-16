"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface AgendaCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  highlightedDates: Date[];
}

export default function AgendaCalendar({
  selectedDate,
  onSelectDate,
  highlightedDates,
}: AgendaCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const firstDayCurrentMonth = startOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const hasAgenda = (date: Date) => {
    return highlightedDates.some((d) => isSameDay(d, date));
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-b border-emerald-100">
        <button
          onClick={previousMonth}
          className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">
          {format(currentMonth, "MMMM yyyy", { locale: id })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-400 py-2 border-b border-gray-50">
        {["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"].map((day) => (
          <div key={day} className="font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-2">
        {days.map((day) => {
          const isSelected = selectedDate
            ? isSameDay(day, selectedDate)
            : false;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const hasEvent = hasAgenda(day);

          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`
                  relative h-9 rounded-lg text-sm flex items-center justify-center transition-all
                  ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                  ${
                    isSelected
                      ? "bg-emerald-600 text-white font-semibold shadow-md z-10"
                      : "hover:bg-gray-100"
                  }
                  ${isTodayDate && !isSelected ? "font-bold text-emerald-600 ring-1 ring-inset ring-emerald-200 bg-emerald-50" : ""}
                `}
            >
              <time dateTime={format(day, "yyyy-MM-dd")}>
                {format(day, "d")}
              </time>

              {/* Event Marker */}
              {hasEvent && (
                <div
                  className={`
                    absolute bottom-1 w-1 h-1 rounded-full
                    ${isSelected ? "bg-white" : "bg-emerald-500"}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
