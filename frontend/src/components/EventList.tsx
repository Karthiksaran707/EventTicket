import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { EventCard } from './EventCard';
import { contractFunctions, Event, getContract, setupEventListeners } from '../utils/contract';

interface EventListProps {
  onViewSeats: (event: Event) => void;
}

export function EventList({ onViewSeats }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'time' | 'popularity'>('date');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEvents();

    // Subscribe to real-time event updates
    const setupListeners = async () => {
      const contract = await getContract();
      setupEventListeners(contract, {
        onEventCancelled: () => {
          loadEvents(); // Reload events immediately when any event is cancelled
        },
        onEventUpdated: () => {
          loadEvents(); // Reload events on any update
        }
      });
    };

    setupListeners();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchTerm, selectedGenre, selectedCity, sortBy, dateFrom, dateTo]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await contractFunctions.getEvents(0, 100);
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(event => event.genre === selectedGenre);
    }

    // City filter
    if (selectedCity !== 'All') {
      filtered = filtered.filter(event => event.city === selectedCity);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(event => new Date(event.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(event => new Date(event.date) <= new Date(dateTo));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'time':
          return a.time.localeCompare(b.time);
        case 'popularity':
          return (b.maxTickets - b.ticketsRemaining) - (a.maxTickets - a.ticketsRemaining);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  };

  const genres = ['All', ...Array.from(new Set(events.map(e => e.genre)))];
  const cities = ['All', ...Array.from(new Set(events.map(e => e.city)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-foreground font-bold text-2xl sm:text-3xl lg:text-4xl">Discover Events</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Buy tickets as NFTs with blockchain technology</p>
      </div>

      {/* Floating Search/Filter Card - Sticky Below Header */}
      <div className="sticky top-16 sm:top-18 z-40 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="bg-card/95 backdrop-blur-md border-b sm:border sm:border-gray-200 dark:border-gray-700 sm:rounded-xl shadow-lg">
          {/* Search Bar - Always Visible */}
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background border border-gray-200 dark:border-gray-700 rounded-lg pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-foreground placeholder:text-muted-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-background border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-6 py-2 sm:py-3 text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm sm:text-base">Filters</span>
              </button>
            </div>
          </div>

          {/* Collapsible Filters - Mobile-optimized */}
          {showFilters && (
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-background border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-background border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-background border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="date">Date</option>
                    <option value="time">Time</option>
                    <option value="price">Price</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-background border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-background border border-gray-200 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              {(dateFrom || dateTo || selectedGenre !== 'All' || selectedCity !== 'All') && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                      setSelectedGenre('All');
                      setSelectedCity('All');
                    }}
                    className="px-3 sm:px-4 py-2 bg-muted border border-gray-200 dark:border-gray-700 text-foreground text-xs sm:text-sm rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results count - Responsive */}
      <div className="text-muted-foreground text-xs sm:text-sm px-1">
        Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
      </div>

      {/* Events Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {filteredEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onViewSeats={() => onViewSeats(event)}
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
