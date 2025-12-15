import { Calendar, MapPin, Ticket, TrendingUp, Clock, Ban } from 'lucide-react';
import { Event } from '../utils/contract';
import { EventStatus } from '../types/events';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventCardProps {
  event: Event;
  onViewSeats: () => void;
}

export function EventCard({ event, onViewSeats }: EventCardProps) {
  const ticketsLeft = event.ticketsRemaining;
  const percentageSold = ((event.maxTickets - ticketsLeft) / event.maxTickets) * 100;
  const percentageLeft = (ticketsLeft / event.maxTickets) * 100;
  const isCancelled = event.status === EventStatus.Cancelled;
  
  // Ticket availability logic
  const getStockStatus = () => {
    if (percentageLeft <= 20) return 'low';
    if (percentageLeft <= 60) return 'medium';
    return 'high';
  };
  
  const getStockColor = () => {
    const status = getStockStatus();
    switch (status) {
      case 'low': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'high': return 'text-emerald-500';
    }
  };
  
  const getStockMessage = () => {
    const status = getStockStatus();
    switch (status) {
      case 'low': return 'Hurry! Almost gone.';
      case 'medium': return 'Selling fast.';
      case 'high': return 'Plenty of seats.';
    }
  };
  
  const getProgressColor = () => {
    const status = getStockStatus();
    switch (status) {
      case 'low': return 'from-red-500 to-red-600';
      case 'medium': return 'from-amber-500 to-amber-600';
      case 'high': return 'from-emerald-500 to-emerald-600';
    }
  };
  
  return (
    <div className="bg-card rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all hover:scale-[1.02] group w-full">
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <ImageWithFallback
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Category Badge - Blue pill for context */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
          <span className="text-primary-foreground font-bold text-[10px] sm:text-xs">{event.genre}</span>
        </div>
        
        {/* Scarcity Badge - FOMO trigger */}
        {getStockStatus() === 'low' && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-yellow-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg animate-pulse">
            <span className="text-white font-bold text-[10px] sm:text-xs">LOW STOCK</span>
          </div>
        )}
        
        {/* Cancelled Stamp - Takes priority */}
        {isCancelled && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-red-400 shadow-xl transform -rotate-12 font-bold text-base sm:text-xl">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Ban className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden xs:inline">CANCELLED</span>
                <span className="xs:hidden">CANCEL</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Sold Out Stamp - Social proof */}
        {!isCancelled && ticketsLeft === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-red-400 shadow-xl transform rotate-12 font-bold text-base sm:text-lg">
              SOLD OUT
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <h3 className="text-card-foreground font-bold text-base sm:text-lg leading-tight line-clamp-2">{event.name}</h3>
      
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{new Date(event.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}</span>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{event.time}</span>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        
        <div className="flex items-center justify-between pt-1 sm:pt-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Ticket className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${getStockColor()}`} />
            <div className="flex flex-col min-w-0">
              <span className="text-card-foreground text-xs sm:text-sm font-medium truncate">
                {ticketsLeft} / {event.maxTickets} left
              </span>
              <span className={`text-[10px] sm:text-xs font-semibold ${getStockColor()} truncate`}>
                {getStockMessage()}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-card-foreground font-bold text-base sm:text-lg">{event.price} ETH</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${getProgressColor()} h-full transition-all duration-500`}
            style={{ width: `${percentageSold}%` }}
          />
        </div>
        
        {/* State-Aware Action Button */}
        {isCancelled ? (
          <button
            disabled
            className="w-full bg-transparent border-2 border-red-500 text-red-500 py-2 sm:py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-sm sm:text-base"
          >
            <Ban className="w-4 h-4" />
            <span className="hidden xs:inline">Event Cancelled</span>
            <span className="xs:hidden">Cancelled</span>
          </button>
        ) : ticketsLeft === 0 ? (
          <button
            disabled
            className="w-full bg-transparent border border-gray-300 text-gray-400 py-2 sm:py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-sm sm:text-base"
          >
            <span className="w-4 h-4">⚠️</span>
            Sold Out
          </button>
        ) : (
          <button
            onClick={onViewSeats}
            className="w-full bg-primary text-primary-foreground py-2 sm:py-3 rounded-lg hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center gap-1.5 sm:gap-2 font-bold shadow-lg text-sm sm:text-base"
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{getStockStatus() === 'low' ? 'GRAB TICKETS NOW' : 'View Seats'}</span>
            <span className="sm:hidden">{getStockStatus() === 'low' ? 'BUY NOW' : 'View'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
