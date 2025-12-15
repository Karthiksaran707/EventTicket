import { Check, ExternalLink, Home, Ticket } from 'lucide-react';

interface TicketConfirmationProps {
  ticket: {
    eventName: string;
    seat: string;
    tokenId: string;
    txHash: string;
    date: string;
    location: string;
    price: string;
  };
  onBackToHome: () => void;
  onViewTickets: () => void;
}

export function TicketConfirmation({ ticket, onBackToHome, onViewTickets }: TicketConfirmationProps) {
  const explorerUrl = `https://etherscan.io/tx/${ticket.txHash}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-xl">
        {/* Success Header */}
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-card-foreground font-bold text-2xl mb-2">Purchase Successful!</h2>
          <p className="text-muted-foreground">Your ticket has been minted as an NFT</p>
        </div>

        {/* Ticket Details */}
        <div className="p-8 space-y-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/30 rounded-lg p-6">
            <h3 className="text-card-foreground font-bold text-lg mb-4">Ticket Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event</span>
                <span className="text-card-foreground font-medium">{ticket.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-card-foreground font-medium">
                  {new Date(ticket.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="text-card-foreground font-medium">{ticket.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seat</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">{ticket.seat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="text-card-foreground font-bold">{ticket.price} ETH</span>
              </div>
            </div>
          </div>

          {/* Blockchain Details */}
          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground text-sm mb-1 font-medium">Token ID</div>
              <div className="text-card-foreground text-sm font-mono break-all">{ticket.tokenId}</div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground text-sm mb-1 font-medium">Transaction Hash</div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-card-foreground text-sm font-mono truncate">{ticket.txHash}</div>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1 text-sm whitespace-nowrap font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </a>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-card-foreground text-sm">
              <strong className="text-card-foreground">Important:</strong> This ticket is stored as an NFT in your wallet. You can view, transfer, or resell it at any time. Present this NFT at the event entrance for admission.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onViewTickets}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-bold"
            >
              <Ticket className="w-5 h-5" />
              View My Tickets
            </button>
            <button
              onClick={onBackToHome}
              className="flex-1 bg-muted border border-gray-200 dark:border-gray-700 text-card-foreground py-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2 font-bold"
            >
              <Home className="w-5 h-5" />
              Back to Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
