import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api, CollegeEvent, Club } from '../api.js';
import { EventCard } from './EventCard.js';
import { ClubCard } from './ClubCard.js';
import { EventModal } from './EventModal.js';

interface CampusExplorerProps {
  onAskAboutEvent?: (eventName: string) => void;
  onAskAboutClub?: (clubName: string) => void;
}

export const CampusExplorer: React.FC<CampusExplorerProps> = ({
  onAskAboutEvent,
  onAskAboutClub,
}) => {
  const [subTab, setSubTab] = useState<'events' | 'clubs'>('events');
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventDateFilter, setEventDateFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalEvent, setActiveModalEvent] = useState<CollegeEvent | null>(null);

  useEffect(() => {
    loadData();
  }, [eventDateFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, clubsRes] = await Promise.all([
        api.listEvents({
          filterDate: eventDateFilter === 'all' ? undefined : eventDateFilter,
        }),
        api.listClubs(),
      ]);
      setEvents(eventsRes.events || []);
      setClubs(clubsRes.clubs || []);
    } catch (err) {
      console.error('Failed to load explorer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.eventName.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.eventType.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      e.eventType.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.activities.some((a) => a.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      c.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const eventCategories = ['All', 'Technical Fest', 'Sports Tournament', 'Cultural Music Fest', 'Workshop & Exhibition', 'Seminar & Workshop', 'Training Workshop'];
  const clubCategories = ['All', 'Sports', 'Cultural', 'Cultural / Music', 'Social / Empowerment', 'Technical'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Page Title & Subtitle */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Campus Life & Opportunities
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Discover college fests, technical workshops, sports tournaments, and student organizations active at SRIT Jabalpur.
        </p>
      </div>

      {/* Main Mode Toggle Tabs */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => {
              setSubTab('events');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              subTab === 'events'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Events & Fests ({events.length})</span>
          </button>

          <button
            onClick={() => {
              setSubTab('clubs');
              setSelectedCategory('All');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              subTab === 'clubs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clubs & Societies ({clubs.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${subTab === 'events' ? 'events, fests, venue...' : 'clubs, sports, activities...'}`}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        {subTab === 'events' ? (
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold shrink-0">
              <button
                onClick={() => setEventDateFilter('upcoming')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  eventDateFilter === 'upcoming'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setEventDateFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  eventDateFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setEventDateFilter('past')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  eventDateFilter === 'past'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Past
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6">
        {(subTab === 'events' ? eventCategories : clubCategories).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400 animate-pulse">
          Loading campus activities...
        </div>
      ) : subTab === 'events' ? (
        filteredEvents.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No events found matching your filter
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Try switching between Upcoming and All, or clear search queries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onViewDetails={(e) => setActiveModalEvent(e)}
                onRegister={(e) => setActiveModalEvent(e)}
              />
            ))}
          </div>
        )
      ) : filteredClubs.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No clubs found matching your search
          </h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onExplore={() => onAskAboutClub?.(club.name)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {activeModalEvent && (
        <EventModal
          event={activeModalEvent}
          onClose={() => setActiveModalEvent(null)}
        />
      )}
    </div>
  );
};
