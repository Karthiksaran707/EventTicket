// Mock smart contract interactions for demo purposes
// In production, replace with actual ethers.js contract calls

import { EventStatus, RefundStatus, RefundMode, RefundRequest } from '../types/events';

export interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  ticketsLeft: number;
  maxTickets: number;
  price: string;
  image: string;
  genre: string;
  city: string;
  organizer: string;
  description?: string;
  status?: EventStatus;
  refundMode?: RefundMode;
  ownerAddress?: string;
}

export interface Ticket {
  tokenId: string;
  eventId: number;
  eventName: string;
  seat: string;
  owner: string;
  purchaseDate: string;
  txHash: string;
  price: string;
  location: string;
  date: string;
  refundStatus?: RefundStatus;
}

// Mock events database
const mockEvents: Event[] = [
  {
    id: 1,
    name: 'Summer Music Festival 2025',
    date: '2025-07-15',
    time: '19:00',
    location: 'Central Park, New York',
    ticketsLeft: 85,
    maxTickets: 100,
    price: '0.05',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    genre: 'Music',
    city: 'New York',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
  },
  {
    id: 2,
    name: 'Tech Conference 2025',
    date: '2025-08-20',
    time: '09:00',
    location: 'Convention Center, San Francisco',
    ticketsLeft: 45,
    maxTickets: 100,
    price: '0.08',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    genre: 'Conference',
    city: 'San Francisco',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
  },
  {
    id: 3,
    name: 'Art Exhibition Gala',
    date: '2025-06-10',
    time: '18:30',
    location: 'Modern Art Museum, London',
    ticketsLeft: 30,
    maxTickets: 50,
    price: '0.03',
    image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
    genre: 'Art',
    city: 'London',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
  },
  {
    id: 4,
    name: 'Rock Concert Live',
    date: '2025-09-05',
    time: '20:00',
    location: 'Arena Stadium, Los Angeles',
    ticketsLeft: 92,
    maxTickets: 100,
    price: '0.06',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    genre: 'Music',
    city: 'Los Angeles',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
  },
  {
    id: 5,
    name: 'Food & Wine Festival',
    date: '2025-10-12',
    time: '12:00',
    location: 'Harbor Front, Miami',
    ticketsLeft: 67,
    maxTickets: 100,
    price: '0.04',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    genre: 'Food',
    city: 'Miami',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
  },
  {
    id: 6,
    name: 'Comedy Night Special',
    date: '2025-07-25',
    time: '21:00',
    location: 'Comedy Club, Chicago',
    ticketsLeft: 8,
    maxTickets: 80,
    price: '0.02',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
    genre: 'Comedy',
    city: 'Chicago',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
  },
  {
    id: 7,
    name: 'NBA Finals Game 7',
    date: '2025-06-18',
    time: '20:00',
    location: 'Madison Square Garden, New York',
    ticketsLeft: 0,
    maxTickets: 150,
    price: '0.25',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    genre: 'Sports',
    city: 'New York',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
  },
  {
    id: 8,
    name: 'Broadway Musical Premiere',
    date: '2025-08-12',
    time: '19:30',
    location: 'Theater District, New York',
    ticketsLeft: 5,
    maxTickets: 120,
    price: '0.15',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    genre: 'Theater',
    city: 'New York',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
  },
  {
    id: 9,
    name: 'Intimate Jazz Night',
    date: '2025-07-18',
    time: '21:00',
    location: 'Blue Note Jazz Club, New York',
    ticketsLeft: 35,
    maxTickets: 35,
    price: '0.03',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    genre: 'Music',
    city: 'New York',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
    description: 'An intimate evening of smooth jazz in a cozy setting.',
  },
  {
    id: 10,
    name: 'Stadium Rock Festival',
    date: '2025-08-25',
    time: '14:00',
    location: 'MetLife Stadium, New Jersey',
    ticketsLeft: 847,
    maxTickets: 1000,
    price: '0.12',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    genre: 'Music',
    city: 'New York',
    organizer: '0x1234...5678',
    status: EventStatus.Active,
    ownerAddress: '0x1234567890123456789012345678901234567890',
    description: 'Multi-day rock festival featuring top international artists.',
  },
];

// Mock seat map (10x10 grid)
const bookedSeats: { [eventId: number]: Set<string> } = {
  1: new Set(['A1', 'A2', 'B3', 'C5', 'D7', 'E2', 'F8', 'G4', 'H6', 'I9', 'J1', 'A5', 'B7', 'C2', 'D9']),
  2: new Set(['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'D1', 'E1', 'F1', 'G1']),
  3: new Set(['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5']),
  4: new Set(['C3', 'D4', 'E5', 'F6', 'G7', 'H8', 'I9', 'J10']),
  5: new Set(['A1', 'B2', 'C3', 'D4', 'E5', 'F6', 'G7', 'H8']),
  6: new Set(['A1', 'A10', 'J1', 'J10', 'E5', 'E6', 'F5', 'F6']),
};

// Mock user tickets
const userTickets: { [address: string]: Ticket[] } = {};

export const getEvents = async (): Promise<Event[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockEvents;
};

export const getSeatMap = async (eventId: number): Promise<{ [key: string]: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) return {};
  
  const seatMap: { [key: string]: boolean } = {};
  
  // Generate valid seat IDs based on maxTickets
  const validSeats = generateValidSeatIds(event.maxTickets);
  
  for (const seatId of validSeats) {
    seatMap[seatId] = bookedSeats[eventId]?.has(seatId) || false;
  }
  
  return seatMap;
};

// Helper function to generate valid seat IDs based on maxTickets
const generateValidSeatIds = (maxTickets: number): string[] => {
  const columns = calculateColumns(maxTickets);
  const rows = Math.ceil(maxTickets / columns);
  
  const seats: string[] = [];
  let seatCount = 0;
  
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const rowLabel = getRowLabel(rowIndex);
    for (let col = 1; col <= columns; col++) {
      if (seatCount >= maxTickets) break;
      seats.push(`${rowLabel}${col}`);
      seatCount++;
    }
    if (seatCount >= maxTickets) break;
  }
  
  return seats;
};

// Calculate columns based on ticket quantity
const calculateColumns = (maxTickets: number): number => {
  if (maxTickets <= 100) return 10;
  if (maxTickets <= 200) return 12;
  if (maxTickets <= 500) return 14;
  if (maxTickets <= 1000) return 15;
  if (maxTickets <= 2000) return 20;
  return 25; // For very large events
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

export const purchaseTicket = async (
  eventId: number,
  seat: string,
  price: string,
  walletAddress: string
): Promise<{ txHash: string; tokenId: string }> => {
  // Simulate transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  // Validate seat is within maxTickets limit
  const validSeats = generateValidSeatIds(event.maxTickets);
  if (!validSeats.includes(seat)) {
    throw new Error(`Invalid seat: ${seat} is outside the valid seat range for this event`);
  }
  
  // Check if seat is already booked
  if (bookedSeats[eventId]?.has(seat)) {
    throw new Error(`Seat ${seat} is already booked`);
  }
  
  // Check if there are tickets left
  if (event.ticketsLeft <= 0) {
    throw new Error('Event is sold out');
  }
  
  // Mark seat as booked
  if (!bookedSeats[eventId]) {
    bookedSeats[eventId] = new Set();
  }
  bookedSeats[eventId].add(seat);
  
  // Generate mock transaction hash and token ID
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  const tokenId = `${eventId}${Date.now()}`;
  
  // Store ticket for user
  if (walletAddress) {
    if (!userTickets[walletAddress]) {
      userTickets[walletAddress] = [];
    }
    
    userTickets[walletAddress].push({
      tokenId,
      eventId,
      eventName: event.name,
      seat,
      owner: walletAddress,
      purchaseDate: new Date().toISOString(),
      txHash,
      price,
      location: event.location,
      date: event.date,
    });
    
    // Decrease tickets left
    event.ticketsLeft--;
  }
  
  return { txHash, tokenId };
};

export const getUserTickets = async (walletAddress: string): Promise<Ticket[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return userTickets[walletAddress] || [];
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'ticketsLeft'>): Promise<Event> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Validate maxTickets is within acceptable range
  if (eventData.maxTickets < 1) {
    throw new Error('Max tickets must be at least 1');
  }
  
  if (eventData.maxTickets > 1000) {
    throw new Error('Max tickets cannot exceed 1000');
  }
  
  // Validate date and time (server-side validation)
  if (eventData.date && eventData.time) {
    const now = new Date();
    const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
    
    if (eventDateTime < now) {
      throw new Error('Event date and time must be in the future. Past dates/times are not allowed.');
    }
  }
  
  // Validate date only (for events without time)
  if (eventData.date && !eventData.time) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const eventDate = new Date(eventData.date);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate < now) {
      throw new Error('Event date must be current or in the future. Past dates are not allowed.');
    }
  }
  
  const newEvent: Event = {
    ...eventData,
    id: mockEvents.length + 1,
    ticketsLeft: eventData.maxTickets,
    status: EventStatus.Active,
    // Ensure ownerAddress is set from eventData
    ownerAddress: eventData.ownerAddress,
  };
  
  mockEvents.push(newEvent);
  return newEvent;
};

export const getOrganizerAnalytics = async (organizerAddress: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const organizerEvents = mockEvents.filter(e => e.organizer === organizerAddress);
  const totalTicketsSold = organizerEvents.reduce((sum, e) => sum + (e.maxTickets - e.ticketsLeft), 0);
  const totalRevenue = organizerEvents.reduce((sum, e) => sum + (e.maxTickets - e.ticketsLeft) * parseFloat(e.price), 0);
  
  return {
    totalEvents: organizerEvents.length,
    totalTicketsSold,
    totalRevenue: totalRevenue.toFixed(4),
    events: organizerEvents.map(e => ({
      id: e.id,
      name: e.name,
      ticketsSold: e.maxTickets - e.ticketsLeft,
      revenue: ((e.maxTickets - e.ticketsLeft) * parseFloat(e.price)).toFixed(4),
      date: e.date,
    })),
  };
};

export const withdrawFunds = async (): Promise<{ txHash: string }> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  return { txHash };
};

// Mock refund requests storage
const refundRequests: { [eventId: number]: RefundRequest[] } = {};

// Event listeners for smart contract events
type EventListener = (data: any) => void;
const eventListeners: { [eventName: string]: EventListener[] } = {
  EventCancelled: [],
  EventUpdated: [], // Real-time UI sync
  RefundRequested: [],
  RefundApproved: [],
  RefundClaimed: []
};

export const addEventListener = (eventName: string, listener: EventListener) => {
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = [];
  }
  eventListeners[eventName].push(listener);
  return () => {
    eventListeners[eventName] = eventListeners[eventName].filter(l => l !== listener);
  };
};

const emitEvent = (eventName: string, data: any) => {
  if (eventListeners[eventName]) {
    eventListeners[eventName].forEach(listener => listener(data));
  }
  
  // Also emit to 'EventUpdated' for real-time UI synchronization
  if (eventName === 'EventCancelled' && eventListeners['EventUpdated']) {
    eventListeners['EventUpdated'].forEach(listener => listener({ 
      type: 'cancelled', 
      eventId: data?.eventId,
      ...data 
    }));
  }
};

// Cancel event
export const cancelEvent = async (
  eventId: number,
  refundMode: RefundMode,
  walletAddress: string
): Promise<{ txHash: string; refundsProcessed: number }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (event.ownerAddress && event.ownerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error('Only the event owner can cancel this event');
  }
  
  // Update event status
  event.status = EventStatus.Cancelled;
  event.refundMode = refundMode;
  
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  // Emit event
  emitEvent('EventCancelled', {
    eventId,
    cancelledBy: walletAddress,
    timestamp: Date.now(),
    refundMode
  });
  
  // If auto-refund, process refunds
  let refundsProcessed = 0;
  if (refundMode === RefundMode.AutoRefund) {
    // Get all tickets for this event
    Object.keys(userTickets).forEach(address => {
      const tickets = userTickets[address].filter(t => t.eventId === eventId);
      tickets.forEach(ticket => {
        ticket.refundStatus = RefundStatus.Refunded;
        refundsProcessed++;
        
        emitEvent('RefundClaimed', {
          eventId,
          buyer: address,
          tokenId: ticket.tokenId,
          amount: ticket.price,
          timestamp: Date.now(),
          txHash: `0x${Math.random().toString(16).substring(2, 66)}`
        });
      });
    });
  }
  
  return { txHash, refundsProcessed };
};

// Request refund (buyer-claim mode)
export const requestRefund = async (
  eventId: number,
  tokenId: string,
  walletAddress: string
): Promise<{ txHash: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (event.status !== EventStatus.Cancelled) {
    throw new Error('Event is not cancelled');
  }
  
  if (event.refundMode !== RefundMode.BuyerClaim) {
    throw new Error('This event does not use buyer-claim refunds');
  }
  
  const userTicket = userTickets[walletAddress]?.find(t => t.tokenId === tokenId);
  if (!userTicket) {
    throw new Error('Ticket not found');
  }
  
  if (userTicket.refundStatus && userTicket.refundStatus !== RefundStatus.None) {
    throw new Error('Refund already requested or processed');
  }
  
  const request: RefundRequest = {
    id: `refund-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    eventId,
    buyerAddress: walletAddress,
    ticketTokenId: tokenId,
    amount: userTicket.price,
    status: RefundStatus.Requested,
    requestedAt: new Date().toISOString()
  };
  
  if (!refundRequests[eventId]) {
    refundRequests[eventId] = [];
  }
  refundRequests[eventId].push(request);
  
  userTicket.refundStatus = RefundStatus.Requested;
  
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  emitEvent('RefundRequested', {
    eventId,
    buyer: walletAddress,
    tokenId,
    amount: userTicket.price,
    timestamp: Date.now()
  });
  
  return { txHash };
};

// Approve refund (admin)
export const approveRefund = async (requestId: string): Promise<{ txHash: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let foundRequest: RefundRequest | null = null;
  let foundEventId: number | null = null;
  
  Object.keys(refundRequests).forEach(eventIdStr => {
    const eventId = parseInt(eventIdStr);
    const request = refundRequests[eventId].find(r => r.id === requestId);
    if (request) {
      foundRequest = request;
      foundEventId = eventId;
    }
  });
  
  if (!foundRequest || foundEventId === null) {
    throw new Error('Refund request not found');
  }
  
  // Type assertion after null check
  const request = foundRequest as RefundRequest;
  const eventId = foundEventId as number;
  
  if (request.status !== RefundStatus.Requested) {
    throw new Error('Refund request is not pending');
  }
  
  request.status = RefundStatus.Approved;
  request.processedAt = new Date().toISOString();
  
  const userTicket = userTickets[request.buyerAddress]?.find(
    t => t.tokenId === request.ticketTokenId
  );
  if (userTicket) {
    userTicket.refundStatus = RefundStatus.Approved;
  }
  
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  emitEvent('RefundApproved', {
    eventId,
    buyer: request.buyerAddress,
    tokenId: request.ticketTokenId,
    amount: request.amount,
    timestamp: Date.now()
  });
  
  return { txHash };
};

// Reject refund (admin)
export const rejectRefund = async (
  requestId: string,
  reason: string
): Promise<{ txHash: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let foundRequest: RefundRequest | null = null;
  
  Object.keys(refundRequests).forEach(eventIdStr => {
    const eventId = parseInt(eventIdStr);
    const request = refundRequests[eventId].find(r => r.id === requestId);
    if (request) {
      foundRequest = request;
    }
  });
  
  if (!foundRequest) {
    throw new Error('Refund request not found');
  }
  
  // Type assertion after null check
  const request = foundRequest as RefundRequest;
  
  if (request.status !== RefundStatus.Requested) {
    throw new Error('Refund request is not pending');
  }
  
  request.status = RefundStatus.Rejected;
  request.processedAt = new Date().toISOString();
  request.rejectionReason = reason;
  
  const userTicket = userTickets[request.buyerAddress]?.find(
    t => t.tokenId === request.ticketTokenId
  );
  if (userTicket) {
    userTicket.refundStatus = RefundStatus.Rejected;
  }
  
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  return { txHash };
};

// Claim refund (buyer after approval)
export const claimRefund = async (
  eventId: number,
  tokenId: string,
  walletAddress: string
): Promise<{ txHash: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  const userTicket = userTickets[walletAddress]?.find(t => t.tokenId === tokenId);
  if (!userTicket) {
    throw new Error('Ticket not found');
  }
  
  if (userTicket.refundStatus !== RefundStatus.Approved) {
    throw new Error('Refund is not approved');
  }
  
  userTicket.refundStatus = RefundStatus.Refunded;
  
  const request = refundRequests[eventId]?.find(
    r => r.ticketTokenId === tokenId && r.buyerAddress === walletAddress
  );
  if (request) {
    request.status = RefundStatus.Refunded;
    request.processedAt = new Date().toISOString();
  }
  
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  if (request) {
    request.txHash = txHash;
  }
  
  emitEvent('RefundClaimed', {
    eventId,
    buyer: walletAddress,
    tokenId,
    amount: userTicket.price,
    timestamp: Date.now(),
    txHash
  });
  
  return { txHash };
};

// Get refund requests for an event
export const getRefundRequests = async (eventId: number): Promise<RefundRequest[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return refundRequests[eventId] || [];
};

// Get user refund status for an event
export const getUserRefundStatus = async (
  eventId: number,
  walletAddress: string
): Promise<{ status: RefundStatus; amount?: string; tokenId?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const userTicket = userTickets[walletAddress]?.find(t => t.eventId === eventId);
  if (!userTicket) {
    return { status: RefundStatus.None };
  }
  
  return {
    status: userTicket.refundStatus || RefundStatus.None,
    amount: userTicket.price,
    tokenId: userTicket.tokenId
  };
};
