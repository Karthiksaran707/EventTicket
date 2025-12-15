import { useState, useEffect } from 'react';
import { ArrowLeft, Ticket as TicketIcon, Calendar, MapPin } from 'lucide-react';
import { contractFunctions, Ticket } from '../utils/contract';

interface EnrichedTicket extends Ticket {
  eventName: string;
  location: string;
  date: string;
  txHash?: string;
}

interface MyTicketsProps {
  walletAddress: string;
  onBack: () => void;
}

export function MyTickets({ walletAddress, onBack }: MyTicketsProps) {
  const [tickets, setTickets] = useState<EnrichedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      loadTickets();
    }
  }, [walletAddress]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const userTickets = await contractFunctions.getUserTickets(walletAddress);

      // Enrich tickets with event data
      const enrichedTickets: EnrichedTicket[] = await Promise.all(
        userTickets.map(async (ticket) => {
          const event = await contractFunctions.getEvent(ticket.eventId);
          return {
            ...ticket,
            eventName: event.name,
            location: event.location,
            date: event.date,
            // txHash is not available from contract
          };
        })
      );

      setTickets(enrichedTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center shadow-lg">
          <TicketIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-card-foreground font-bold text-xl mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to view your tickets</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Events
      </button>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-foreground font-black text-3xl">My Tickets</h1>
        <p className="text-muted-foreground text-lg">Your NFT ticket collection</p>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center shadow-lg">
          <TicketIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-card-foreground font-bold text-xl mb-2">No Tickets Yet</h2>
          <p className="text-muted-foreground">Purchase your first event ticket to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.tokenId}
              className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-card-foreground font-bold text-lg mb-2">{ticket.eventName}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(ticket.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{ticket.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="bg-purple-500/20 dark:bg-purple-500/30 border border-purple-500/50 px-4 py-2 rounded-lg">
                      <div className="text-muted-foreground text-xs font-medium">Seat</div>
                      <div className="text-purple-600 dark:text-purple-400 font-bold">{ticket.seat}</div>
                    </div>
                    <div className="bg-muted px-4 py-2 rounded-lg">
                      <div className="text-muted-foreground text-xs font-medium">Price</div>
                      <div className="text-card-foreground text-sm font-bold">{ticket.price} ETH</div>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-3 space-y-2">
                    <div>
                      <div className="text-muted-foreground text-xs font-medium">Token ID</div>
                      <div className="text-card-foreground text-xs font-mono">{ticket.tokenId}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/30 dark:to-pink-500/30 border border-purple-500/50 rounded-lg p-4 text-center min-w-[120px]">
                  <TicketIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-card-foreground text-xs font-medium">NFT Ticket</div>
                  <div className="text-muted-foreground text-xs mt-1">#{ticket.tokenId.toString().slice(-6)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tickets.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-card-foreground text-sm">
            <strong className="text-card-foreground">Note:</strong> All tickets are stored as NFTs in your wallet. You can transfer or resell them at any time. Present your NFT at the event entrance for admission.
          </p>
        </div>
      )}
    </div>
  );
}
