import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  X,
  Sparkles,
  Train,
  Plane,
  Bus,
  Search,
  Building,
  Compass,
} from 'lucide-react';
import { api } from '../api.js';

interface CampusMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusMapsModal: React.FC<CampusMapsModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('How to reach SRIT campus from Jabalpur Railway Station?');
  const [userLocation, setUserLocation] = useState('Jabalpur Junction (JBP)');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    groundingMetadata?: any;
    locationContext: {
      campusName: string;
      address: string;
      landmark: string;
      city: string;
      railwayDistance: string;
      airportDistance: string;
      googleMapsUrl: string;
    };
  } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.queryMaps({
        query: searchQuery,
        userLocation: userLocation || undefined,
      });
      setResult(res);
    } catch (e) {
      console.error('Maps query error:', e);
    } finally {
      setLoading(false);
    }
  };

  const quickRoutes = [
    {
      title: 'From Jabalpur Railway Station (JBP)',
      query: 'What is the fastest route and distance from Jabalpur Railway Station (JBP) to SRIT Jabalpur?',
      loc: 'Jabalpur Railway Station',
    },
    {
      title: 'From Dumna Airport (JLR)',
      query: 'How to reach SRIT campus from Dumna Airport Jabalpur and what are the cab options?',
      loc: 'Dumna Airport, Jabalpur',
    },
    {
      title: 'From ISBT Damoh Naka Bus Stand',
      query: 'What is the public transit route from Damoh Naka ISBT to SRIT campus?',
      loc: 'Damoh Naka ISBT',
    },
    {
      title: 'Nearby Student Hostels & Facilities',
      query: 'What hostels, PG accommodations, ATMs, and medical clinics are located near SRIT Madhotal campus?',
      loc: 'Madhotal, Jabalpur',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  SRIT Campus Navigation & Google Maps Intelligence
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  gemini-3.5-flash + Maps
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live maps grounding, directions, transit options, and landmark intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Official Campus Landmark Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Shri Ram Institute of Technology (SRIT)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Near I.T.I., Madhotal, Karmeta, Jabalpur, Madhya Pradesh 482002
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Train className="w-3.5 h-3.5 text-blue-500" /> ~8.2 km from Jabalpur Jn.
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 text-purple-500" /> ~22 km from Dumna Airport
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5 text-emerald-500" /> ~5 km from ISBT
                </span>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Shri+Ram+Institute+of+Technology+Jabalpur"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Open Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="font-semibold text-xs text-slate-700 dark:text-slate-300 block">
              Ask Location, Directions, or Nearby Place Information
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. How do I reach SRIT from Madhotal or Vijay Nagar?"
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loading ? 'Routing...' : 'Navigate'}</span>
              </button>
            </div>
          </div>

          {/* Quick Route Shortcuts */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Frequent Campus Routes & Queries
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {quickRoutes.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(r.query);
                    setUserLocation(r.loc);
                    handleSearch(r.query);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-left transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 flex items-center justify-between">
                    <span>{r.title}</span>
                    <Navigation className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {r.query}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Search Result */}
          {result && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-900/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-slate-700 pb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Grounded Maps Advice
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Verified SRIT Location Coordinates
                </span>
              </div>

              <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {result.answer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
