import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { CollegeEvent } from '../api.js';

interface EventModalProps {
  event: CollegeEvent;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const [registered, setRegistered] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPast = new Date(event.date) < new Date(new Date().toISOString().split('T')[0]);
  const isRegistrationOpen =
    !isPast &&
    event.status !== 'Cancelled' &&
    (!event.registrationDeadline || new Date(event.registrationDeadline) >= new Date());

  const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `${event.eventName} at SRIT Jabalpur - ${formattedDate}. Details: https://sritgroup.net/`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto p-6 text-slate-800 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {event.eventType}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 font-semibold rounded-full ${
                isRegistrationOpen
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {isRegistrationOpen ? 'Registration Active' : 'Registration Closed'}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {event.eventName}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-slate-400">Date</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-slate-400">Time</p>
              <p className="font-semibold">{event.startTime} {event.endTime ? `- ${event.endTime}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-slate-400">Venue</p>
              <p className="font-semibold">{event.venue}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              About the Event
            </h4>
            <p>{event.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Eligibility & Participants
            </h4>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {event.eligibility}
            </p>
          </div>

          {event.registrationDeadline && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Registration Deadline
              </h4>
              <p className="font-semibold text-amber-600 dark:text-amber-400">
                {new Date(event.registrationDeadline).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {(event.contactPerson || event.contactPhone || event.contactEmail) && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Contact & Queries
              </h4>
              {event.contactPerson && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.contactPerson}</span>
                </div>
              )}
              {event.contactEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${event.contactEmail}`} className="text-blue-600 hover:underline">
                    {event.contactEmail}
                  </a>
                </div>
              )}
              {event.contactPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.contactPhone}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleShare}
            className="p-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied Link!' : 'Share'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            {isRegistrationOpen && (
              <button
                onClick={() => setRegistered(true)}
                disabled={registered}
                className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                  registered
                    ? 'bg-emerald-600 hover:bg-emerald-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {registered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registered Successfully!</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Registration</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
