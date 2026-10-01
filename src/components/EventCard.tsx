import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { CollegeEvent } from '../api.js';

interface EventCardProps {
  event: CollegeEvent;
  onViewDetails?: (event: CollegeEvent) => void;
  onRegister?: (event: CollegeEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onRegister,
}) => {
  const isPast = new Date(event.date) < new Date(new Date().toISOString().split('T')[0]);
  const isRegistrationOpen =
    !isPast &&
    event.status !== 'Cancelled' &&
    (!event.registrationDeadline || new Date(event.registrationDeadline) >= new Date());

  const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white/95 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-4 my-2 text-slate-800 dark:text-slate-100">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 mb-1">
            {event.eventType}
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {event.eventName}
          </h4>
        </div>
        <span
          className={`text-xs px-2.5 py-1 font-semibold rounded-full flex items-center gap-1 shrink-0 ${
            event.status === 'Cancelled'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              : isPast
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              : isRegistrationOpen
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
          }`}
        >
          {event.status === 'Cancelled' ? (
            'CANCELLED'
          ) : isPast ? (
            'COMPLETED'
          ) : isRegistrationOpen ? (
            <>
              <CheckCircle2 className="w-3 h-3" /> REGISTRATION OPEN
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" /> REGISTRATION CLOSED
            </>
          )}
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
        {event.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{event.startTime}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(event)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            View Details
          </button>
        )}
        {isRegistrationOpen && (
          <button
            onClick={() => (onRegister ? onRegister(event) : onViewDetails?.(event))}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <span>Register</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
