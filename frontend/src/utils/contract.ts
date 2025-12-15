import { ethers } from 'ethers';
import EventTicketABI from '../deployments/EventTicket-abi.json';
import deploymentInfo from '../deployments/EventTicket.json';

const CONTRACT_ADDRESS = deploymentInfo.contractAddress;

export const getProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

export const getContract = async (needsSigner = false) => {
  if (needsSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, EventTicketABI, signer);
  } else {
    const provider = getProvider();
    return new ethers.Contract(CONTRACT_ADDRESS, EventTicketABI, provider);
  }
};

export interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  city: string;
  genre: string;
  maxTickets: number;
  ticketsRemaining: number;
  price: string;
  imageUrl: string;
  owner: string;
  status: number;
  refundMode: number;
  description: string;
}

export interface Ticket {
  tokenId: string;
  eventId: number;
  eventName: string;
  seat: string;
  owner: string;
  purchaseDate: string;
  txHash?: string;
  price: string;
  location: string;
  date: string;
  refundStatus?: number;
}

export const contractFunctions = {
  createEvent: async (eventData: {
    name: string;
    date: string;
    time: string;
    location: string;
    city: string;
    genre: string;
    maxTickets: number;
    price: string;
    imageUrl: string;
    description: string;
  }) => {
    const contract = await getContract(true);
    const priceWei = ethers.parseEther(eventData.price);
    
    const tx = await contract.createEvent(
      eventData.name,
      eventData.date,
      eventData.time,
      eventData.location,
      eventData.city,
      eventData.genre,
      eventData.maxTickets,
      priceWei,
      eventData.imageUrl,
      eventData.description
    );
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  mintTicket: async (eventId: number, seat: string, price: string) => {
    const contract = await getContract(true);
    const priceWei = ethers.parseEther(price);

    const tx = await contract.mint(eventId, seat, { value: priceWei });
    const receipt = await tx.wait();
    return { txHash: receipt.hash, tokenId: 'pending' }; // TokenId not directly returned, use pending
  },

  cancelEvent: async (eventId: number, refundMode: number) => {
    const contract = await getContract(true);
    
    const tx = await contract.cancelEvent(eventId, refundMode);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  requestRefund: async (eventId: number) => {
    const contract = await getContract(true);
    
    const tx = await contract.requestRefund(eventId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  approveRefund: async (eventId: number) => {
    const contract = await getContract(true);
    
    const tx = await contract.approveRefund(eventId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  rejectRefund: async (eventId: number, reason: string) => {
    const contract = await getContract(true);
    
    const tx = await contract.rejectRefund(eventId, reason);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  claimRefund: async (eventId: number) => {
    const contract = await getContract(true);
    
    const tx = await contract.claimRefund(eventId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  // FIXED: Withdraw with error handling and duplicate prevention
  withdraw: async (eventId: number) => {
    const contract = await getContract(true);
    console.log(`💰 Attempting withdrawal for Event ${eventId}`);

    // Estimate gas first to detect reverts cleanly
    try {
      await contract.withdraw.estimateGas(eventId);
    } catch (e: any) {
      if (e.message.includes("No new funds")) {
        throw new Error("No funds available to withdraw for this event.");
      }
      throw e;
    }

    const tx = await contract.withdraw(eventId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  },

  getEvent: async (eventId: number): Promise<Event> => {
    const contract = await getContract();
    const event = await contract.getEventDetails(eventId);
    
    return {
      id: Number(event.id),
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      city: event.city,
      genre: event.genre,
      maxTickets: Number(event.maxTickets),
      ticketsRemaining: Number(event.ticketsRemaining),
      price: ethers.formatEther(event.price),
      imageUrl: event.imageUrl,
      owner: event.owner,
      status: Number(event.status),
      refundMode: Number(event.refundMode),
      description: event.description
    };
  },

  getEvents: async (offset = 0, limit = 50): Promise<Event[]> => {
    try {
      const contract = await getContract();
      const events = await contract.getEvents(offset, limit);

      // Filter out empty/deleted events if necessary
      const validEvents = events.filter((e: any) => e.id.toString() !== '0');

      return validEvents.map((event: any) => ({
        id: Number(event.id),
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        city: event.city,
        genre: event.genre,
        maxTickets: Number(event.maxTickets),
        ticketsRemaining: Number(event.ticketsRemaining),
        price: ethers.formatEther(event.price),
        imageUrl: event.imageUrl,
        owner: event.owner, // Crucial: ensure this address is passed correctly
        status: Number(event.status),
        refundMode: Number(event.refundMode),
        description: event.description
      }));
    } catch (error) {
      console.error("Failed to fetch events from contract:", error);
      return []; // Return empty array instead of fallback mock data
    }
  },

  getUserTickets: async (walletAddress: string): Promise<Ticket[]> => {
    const contract = await getContract();
    const tickets = await contract.getUserTickets(walletAddress);
    
    return tickets.map((ticket: any) => ({
      tokenId: ticket.tokenId.toString(),
      eventId: Number(ticket.eventId),
      eventName: ticket.eventName,
      seat: ticket.seat,
      owner: ticket.owner,
      purchaseDate: ticket.purchaseDate,
      txHash: ticket.txHash,
      price: ethers.formatEther(ticket.price),
      location: ticket.location,
      date: ticket.date,
      refundStatus: Number(ticket.refundStatus)
    }));
  },

  getTotalEvents: async (): Promise<number> => {
    const contract = await getContract();
    const total = await contract.getTotalEvents();
    return Number(total);
  },

  // ... [Keep remaining getters] ...
  
  getSeatMap: async (eventId: number): Promise<{ [key: string]: boolean }> => {
    const contract = await getContract();
    const seatMap: { [key: string]: boolean } = {};

    try {
      // Call the new view function for efficient fetching
      const takenSeats: string[] = await contract.getTakenSeats(eventId);

      // Populate map efficiently
      takenSeats.forEach((seat) => {
        seatMap[seat] = true;
      });

      return seatMap;
    } catch (error) {
      console.error("Error fetching taken seats:", error);
      // Fallback: return empty object
      return {};
    }
  },

  isSeatTaken: async (eventId: number, seat: string): Promise<boolean> => {
    const contract = await getContract();
    return await contract.isSeatTaken(eventId, seat);
  },

  // Helper to get total sales for an event (useful for UI logic)
  getEventSales: async (eventId: number) => {
    const event = await contractFunctions.getEvent(eventId);
    return event.maxTickets - event.ticketsRemaining;
  }
};

export const setupEventListeners = (contract: ethers.Contract, listeners: {
  onEventCancelled?: (data: any) => void;
  onTicketMinted?: (data: any) => void;
  onEventCreated?: (data: any) => void;
  onEventUpdated?: (data: any) => void;
}) => {
  if (listeners.onEventCancelled) {
    contract.on('EventCancelled', listeners.onEventCancelled);
  }
  if (listeners.onTicketMinted) {
    contract.on('TicketMinted', listeners.onTicketMinted);
  }
  if (listeners.onEventCreated) {
    contract.on('EventCreated', listeners.onEventCreated);
  }
  if (listeners.onEventUpdated) {
    contract.on('EventUpdated', listeners.onEventUpdated);
  }
};

export default contractFunctions;