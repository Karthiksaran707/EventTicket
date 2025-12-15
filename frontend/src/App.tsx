import { useState } from 'react';
import { Header } from './components/Header';
import { EventList } from './components/EventList';
import { SeatMap } from './components/SeatMap';
import { TicketConfirmation } from './components/TicketConfirmation';
import { MyTickets } from './components/MyTickets';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import { Event } from './utils/contract';

type Page = 'home' | 'seatMap' | 'confirmation' | 'myTickets' | 'dashboard' | 'admin';

type SelectedEvent = Event;

interface PurchasedTicket {
  eventId: number;
  eventName: string;
  seat: string;
  tokenId: string;
  txHash: string;
  date: string;
  location: string;
  price: string;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [purchasedTicket, setPurchasedTicket] = useState<PurchasedTicket | null>(null);
  
  // Get wallet state from context
  const { walletAddress, isConnected } = useWallet();

  const handleViewSeats = (event: SelectedEvent) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setSelectedEvent(event);
    setCurrentPage('seatMap');
  };

  const handlePurchaseComplete = (ticket: PurchasedTicket) => {
    setPurchasedTicket(ticket);
    setCurrentPage('confirmation');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedEvent(null);
    setPurchasedTicket(null);
  };

  const handleNavigate = (page: 'home' | 'myTickets' | 'dashboard' | 'admin') => {
    // Check wallet connection for protected pages
    if (page !== 'home' && !isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setCurrentPage(page);
    setSelectedEvent(null);
    setPurchasedTicket(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <EventList onViewSeats={handleViewSeats} />;
        
      case 'seatMap':
        return selectedEvent && walletAddress ? (
          <SeatMap
            event={selectedEvent}
            walletAddress={walletAddress}
            onPurchaseComplete={handlePurchaseComplete}
            onBack={handleBackToHome}
          />
        ) : null;
        
      case 'confirmation':
        return purchasedTicket ? (
          <TicketConfirmation
            ticket={purchasedTicket}
            onBackToHome={handleBackToHome}
            onViewTickets={() => setCurrentPage('myTickets')}
          />
        ) : null;
        
      case 'myTickets':
        return walletAddress ? (
          <MyTickets 
            walletAddress={walletAddress} 
            onBack={handleBackToHome} 
          />
        ) : null;
        
      case 'dashboard':
        return walletAddress ? (
          <OrganizerDashboard 
            walletAddress={walletAddress} 
            onBack={handleBackToHome} 
          />
        ) : null;
        
      case 'admin':
        return walletAddress ? (
          <AdminPanel 
            walletAddress={walletAddress} 
            onBack={handleBackToHome} 
          />
        ) : null;
        
      default:
        return <EventList onViewSeats={handleViewSeats} />;
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ThemeProvider>
  );
}