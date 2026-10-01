import React from 'react';
import { Users, Info, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { Club } from '../api.js';

interface ClubCardProps {
  club: Club;
  onExplore?: (club: Club) => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onExplore }) => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-4 my-2 text-slate-800 dark:text-slate-100">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50 mb-1">
            {club.category}
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {club.name}
          </h4>
        </div>
        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Users className="w-4 h-4" />
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
        {club.description}
      </p>

      {club.activities && club.activities.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Key Activities
          </p>
          <div className="flex flex-wrap gap-1.5">
            {club.activities.map((act, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
              >
                {act}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[200px]">{club.eligibility}</span>
        </div>
        {club.contactEmail && (
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a
              href={`mailto:${club.contactEmail}`}
              className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[160px]"
            >
              {club.contactEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
