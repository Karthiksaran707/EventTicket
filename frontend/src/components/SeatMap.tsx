import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, Calendar, Clock, MapPin, Ticket, Ban, AlertTriangle } from 'lucide-react';
import { contractFunctions } from '../utils/contract';
import { Event } from '../utils/contract';
import { EventStatus } from '../types/events';

interface SeatMapProps {
  event: Event;
  walletAddress: string;
  onPurchaseComplete: (ticket: any) => void;
  onBack: () => void;
}

type SeatStatus = 'available' | 'taken' | 'selected';

export function SeatMap({ event, walletAddress, onPurchaseComplete, onBack }: SeatMapProps) {
  const [seatMap, setSeatMap] = useState<{ [key: string]: boolean }>({});
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isCancelled = event.status === EventStatus.Cancelled;

  useEffect(() => {
    loadSeatMap();
  }, [event.id]);

  const loadSeatMap = async () => {
    setLoading(true);
    try {
      const seats = await contractFunctions.getSeatMap(event.id);
      setSeatMap(seats);
      console.log('✅ Seat map loaded:', seats);
    } catch (error) {
      console.error('❌ Error loading seat map:', error);
      setErrorMessage('Failed to load seat map');
    } finally {
      setLoading(false);
    }
  };

  const getSeatStatus = (seatId: string): SeatStatus | 'invalid' => {
    if (!isValidSeat(seatId)) return 'invalid';
    if (selectedSeat === seatId) return 'selected';
    if (seatMap[seatId]) return 'taken';
    return 'available';
  };

  const getSeatColor = (status: SeatStatus | 'invalid'): string => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-400 cursor-pointer';
      case 'taken':
        return 'bg-gray-600 cursor-not-allowed';
      case 'selected':
        return 'bg-yellow-500 cursor-pointer';
      case 'invalid':
        return 'bg-transparent border border-dashed border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-30';
    }
  };

  const handleSeatClick = (seatId: string) => {
    if (isCancelled) return;
    
    const status = getSeatStatus(seatId);
    if (status === 'taken' || status === 'invalid') return;

    if (selectedSeat === seatId) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seatId);
    }
    setErrorMessage('');
  };

  const handlePurchase = async () => {
    if (isCancelled) {
      alert('This event has been cancelled. Tickets are no longer available for purchase.');
      return;
    }
    
    if (!selectedSeat || !walletAddress) {
      alert('Please select a seat and connect your wallet');
      return;
    }

    setPurchasing(true);
    setErrorMessage('');
    
    try {
      console.log('🎫 Starting ticket purchase...');
      console.log({
        eventId: event.id,
        seat: selectedSeat,
        price: event.price,
        walletAddress
      });

      // Step 1: Verify seat is still available
      console.log('🔍 Verifying seat availability...');
      const isTaken = await contractFunctions.isSeatTaken(event.id, selectedSeat);
      
      if (isTaken) {
        throw new Error(`Seat ${selectedSeat} was just taken by someone else. Please select another seat.`);
      }
      console.log('✅ Seat is available');

      // Step 2: Verify event is still active
      const eventDetails = await contractFunctions.getEvent(event.id);
      
      console.log('🔍 Event Details from Contract:', {
        id: eventDetails.id,
        name: eventDetails.name,
        status: eventDetails.status,
        statusName: ['Active', 'Cancelled', 'Postponed', 'Completed'][eventDetails.status],
        ticketsRemaining: eventDetails.ticketsRemaining,
        maxTickets: eventDetails.maxTickets,
        price: eventDetails.price
      });
      
      if (eventDetails.status !== EventStatus.Active && eventDetails.status !== 0) {
        const statusName = ['Active', 'Cancelled', 'Postponed', 'Completed'][eventDetails.status];
        throw new Error(`This event is ${statusName}. Current status: ${eventDetails.status}`);
      }
      if (eventDetails.ticketsRemaining === 0) {
        throw new Error('This event is sold out');
      }
      console.log('✅ Event is active with tickets available');

      // Step 3: Call contract to mint ticket with enhanced error handling
      console.log('💳 Calling contract mintTicket...');
      
      const result = await contractFunctions.mintTicket(
        event.id,
        selectedSeat,
        event.price
      );

      console.log('✅ Ticket minted successfully:', result);

      // Step 4: Complete purchase
      onPurchaseComplete({
        eventId: event.id,
        eventName: event.name,
        seat: selectedSeat,
        tokenId: result.tokenId?.toString() || 'pending',
        txHash: result.txHash,
        date: event.date,
        location: event.location,
        price: event.price,
      });
      
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      
      // Parse error message
      let errorMsg = 'Failed to purchase ticket. Please try again.';
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMsg = 'Transaction cancelled by user';
      } else if (error.message) {
        // Extract meaningful error from contract revert
        if (error.message.includes('Seat already taken')) {
          errorMsg = `Seat ${selectedSeat} is already taken. Please select another seat.`;
          await loadSeatMap(); // Refresh seat map
        } else if (error.message.includes('Event sold out')) {
          errorMsg = 'This event is sold out.';
        } else if (error.message.includes('Incorrect payment')) {
          errorMsg = 'Payment amount is incorrect. Please try again.';
        } else if (error.message.includes('Event not active')) {
          errorMsg = 'This event is no longer active.';
        } else if (error.message.includes('insufficient funds')) {
          errorMsg = 'Insufficient ETH in your wallet. Please add more funds.';
        } else if (error.message.includes('Max tickets per wallet')) {
          errorMsg = 'You have reached the maximum tickets allowed per wallet for this event.';
        } else if (error.reason) {
          errorMsg = error.reason;
        } else {
          errorMsg = `Transaction failed: ${error.message.substring(0, 100)}`;
        }
      }
      
      setErrorMessage(errorMsg);
      alert(errorMsg);
      
    } finally {
      setPurchasing(false);
    }
  };

  // Calculate columns based on ticket quantity
  const calculateColumns = (maxTickets: number): number => {
    if (maxTickets <= 100) return 10;
    if (maxTickets <= 200) return 12;
    if (maxTickets <= 500) return 14;
    if (maxTickets <= 1000) return 15;
    if (maxTickets <= 2000) return 20;
    return 25;
  };

  // Generate row labels (A, B, C, ..., Z, AA, AB, ...)
  const getRowLabel = (index: number): string => {
    let label = '';
    let num = index;
    
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
      if (num < 0) break;
    }
    
    return label;
  };

  // Generate seat layout based on maxTickets
  const generateSeatLayout = () => {
    const maxTickets = event.maxTickets;
    const columns = calculateColumns(maxTickets);
    const rows = Math.ceil(maxTickets / columns);
    
    const rowLabels = Array.from({ length: rows }, (_, i) => getRowLabel(i));
    
    return { rowLabels, columns, maxTickets };
  };

  const { rowLabels, columns, maxTickets } = generateSeatLayout();
  
  // Generate seat IDs for exactly maxTickets seats
  const generateSeatIds = () => {
    const allSeats: string[] = [];
    let seatCount = 0;
    
    for (let rowIndex = 0; rowIndex < rowLabels.length; rowIndex++) {
      const row = rowLabels[rowIndex];
      for (let col = 1; col <= columns; col++) {
        if (seatCount >= maxTickets) break;
        allSeats.push(`${row}${col}`);
        seatCount++;
      }
      if (seatCount >= maxTickets) break;
    }
    
    return allSeats;
  };
  
  const validSeatIds = new Set(generateSeatIds());
  
  // Check if a seat ID is valid
  const isValidSeat = (seatId: string): boolean => {
    return validSeatIds.has(seatId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Events
      </button>

      {/* Page Title */}
      <div>
        <h1 className="text-foreground font-bold text-2xl">Select Your Seats</h1>
        <p className="text-muted-foreground">Choose your preferred seat for {event.name}</p>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 dark:text-red-200 font-bold">Transaction Failed</h3>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Seat Map + Event Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Seat Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Seating Info & Legend */}
          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Layout:</span>
                  <span className="text-card-foreground font-bold">{columns} columns × {rowLabels.length} rows</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Total Seats:</span>
                  <span className="text-card-foreground font-bold">{maxTickets}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-card-foreground text-sm font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <span className="text-card-foreground text-sm font-medium">Taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                <span className="text-card-foreground text-sm font-medium">Selected</span>
              </div>
            </div>
          </div>

          {/* Stage */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/30 dark:to-pink-500/30 border border-purple-500/50 rounded-lg py-3 text-center">
            <span className="text-card-foreground font-bold text-lg">STAGE</span>
          </div>

          {/* Seat Map */}
          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-6 overflow-x-auto shadow-lg">
            <div className="inline-block min-w-full">
              {/* Column headers */}
              <div className="flex gap-2 mb-2">
                <div className="w-8"></div>
                {Array.from({ length: columns }, (_, i) => i + 1).map(col => (
                  <div key={col} className="w-10 h-8 flex items-center justify-center text-muted-foreground text-sm font-medium">
                    {col}
                  </div>
                ))}
              </div>
              {/* Seat rows */}
              {rowLabels.map((row, rowIndex) => {
                const seatsInThisRow: string[] = [];
                const startSeatNum = rowIndex * columns;
                
                for (let col = 1; col <= columns; col++) {
                  const seatNum = startSeatNum + col - 1;
                  if (seatNum < maxTickets) {
                    seatsInThisRow.push(`${row}${col}`);
                  }
                }
                
                return (
                  <div key={row} className="flex gap-2 mb-2">
                    <div className="w-8 h-10 flex items-center justify-center text-muted-foreground font-medium">
                      {row}
                    </div>
                    {seatsInThisRow.map(seatId => {
                      const status = getSeatStatus(seatId);
                      const isValid = status !== 'invalid';
                      
                      return (
                        <button
                          key={seatId}
                          onClick={() => handleSeatClick(seatId)}
                          disabled={status === 'taken' || status === 'invalid'}
                          className={`w-10 h-10 rounded transition-colors ${getSeatColor(status)} flex items-center justify-center text-white text-xs`}
                          title={isValid ? `Seat ${seatId} - ${status}` : 'Not available'}
                        >
                          {status === 'selected' && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Event Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg sticky top-6">
            {/* Event Image */}
            {event.imageUrl && (
              <div className="w-full h-52 overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event Details */}
            <div className="p-6 space-y-4">
              <h2 className="text-card-foreground font-bold text-xl leading-tight">{event.name}</h2>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-card-foreground font-medium text-sm">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-card-foreground font-medium text-sm">{event.time}</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-card-foreground font-medium text-sm">{event.location}</p>
                    {event.city && (
                      <p className="text-muted-foreground text-xs mt-0.5">{event.city}</p>
                    )}
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-card-foreground font-semibold text-sm mb-2">About This Event</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-muted-foreground text-xs">Ticket Price</p>
                    <p className="text-card-foreground font-bold text-lg">{event.price} ETH</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm font-medium">Available Seats</span>
                    <span className="text-card-foreground font-bold text-lg">
                      {event.ticketsRemaining} / {event.maxTickets}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${(event.ticketsRemaining / event.maxTickets) * 100}%` }}
                    />
                  </div>
                  {event.ticketsRemaining <= 10 && event.ticketsRemaining > 0 && (
                    <p className="text-orange-600 dark:text-orange-400 text-xs font-semibold mt-2">
                      ⚠️ Only {event.ticketsRemaining} seats left!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancelled Event Notice */}
      {isCancelled && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-bold text-lg">Event Cancelled</h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                This event has been cancelled. Ticket purchases are no longer available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Panel */}
      {!isCancelled && selectedSeat && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/30 dark:to-pink-500/30 border border-purple-500/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-card-foreground font-bold text-lg">Selected Seat: {selectedSeat}</h3>
              <p className="text-muted-foreground">Price: {event.price} ETH</p>
            </div>
            <button
              onClick={handlePurchase}
              disabled={purchasing || !walletAddress}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 font-bold"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Purchase Ticket</>
              )}
            </button>
          </div>
          {!walletAddress && (
            <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Please connect your wallet to purchase</p>
          )}
        </div>
      )}
    </div>
  );
}