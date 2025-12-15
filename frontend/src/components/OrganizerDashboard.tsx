import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, Ban, Wallet, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { contractFunctions, Event, getContract, setupEventListeners } from '../utils/contract';
import { CancelEventModal } from './CancelEventModal';
import { RefundMode, CancellationProgress } from '../types/events';
import { ethers } from 'ethers';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-white" />,
    error: <XCircle className="w-5 h-5 text-white" />,
    info: <AlertCircle className="w-5 h-5 text-white" />
  };

  return (
    <div className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50`}>
      {icons[type]}
      <p className="font-medium">{message}</p>
    </div>
  );
};

interface OrganizerDashboardProps {
  walletAddress: string;
  onBack: () => void;
}

// Enhanced interface to hold all necessary display data without secondary lookups
interface AnalyticsEventData {
  id: number;
  name: string;
  date: number; // timestamp
  dateString: string;
  ticketsSold: number;
  revenue: string;
  status: number;
  refundMode: number;
  owner: string;
  maxTickets: number;
  ticketsRemaining: number;
}

interface AnalyticsData {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: string;
  events: AnalyticsEventData[];
}

export function OrganizerDashboard({ walletAddress, onBack }: OrganizerDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawEventId, setWithdrawEventId] = useState<number | null>(null); // Track which event is withdrawing
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellationProgress, setCancellationProgress] = useState<CancellationProgress | undefined>();

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (walletAddress) {
      loadAnalytics();
    }

    // Subscribe to contract events to auto-refresh dashboard
    const setupListeners = async () => {
      const contract = await getContract();
      setupEventListeners(contract, {
        onEventCancelled: () => loadAnalytics(),
        onTicketMinted: () => loadAnalytics(),
        onEventCreated: () => loadAnalytics(), // Listen for new events
        onEventUpdated: () => loadAnalytics()
      });
    };

    setupListeners();
  }, [walletAddress]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Get all events
      const allEvents = await contractFunctions.getEvents(0, 100);
      
      // 2. Filter events owned by this organizer (Case Insensitive Fix)
      const myEvents = allEvents.filter(
        (event: Event) => event.owner?.toLowerCase() === walletAddress.toLowerCase()
      );

      let totalTicketsSold = 0;
      let totalRevenueWei = ethers.toBigInt(0);

      const eventAnalytics: AnalyticsEventData[] = myEvents.map((event: Event) => {
        const ticketsSold = event.maxTickets - event.ticketsRemaining;
        const priceWei = ethers.parseEther(event.price);
        const eventRevenue = priceWei * BigInt(ticketsSold);
        
        totalTicketsSold += ticketsSold;
        totalRevenueWei += eventRevenue;

        // Create a date timestamp for sorting/charts
        const dateObj = new Date(`${event.date}T${event.time}`);
        
        return {
          id: event.id,
          name: event.name,
          date: Math.floor(dateObj.getTime() / 1000),
          dateString: event.date,
          ticketsSold,
          revenue: ethers.formatEther(eventRevenue),
          status: event.status,
          refundMode: event.refundMode,
          owner: event.owner,
          maxTickets: event.maxTickets,
          ticketsRemaining: event.ticketsRemaining
        };
      });

      setAnalytics({
        totalEvents: myEvents.length,
        totalTicketsSold,
        totalRevenue: ethers.formatEther(totalRevenueWei),
        events: eventAnalytics
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvent = async (refundMode: RefundMode) => {
    if (!selectedEvent) return;

    setIsProcessing(true);
    setCancellationProgress({
      step: 'confirming',
      message: 'Confirming transaction on the blockchain...',
      progress: 10
    });

    try {
      // Step 1: Cancel Event
      setCancellationProgress({
        step: 'cancelling',
        message: 'Cancelling event on-chain...',
        progress: 30
      });

      const { txHash } = await contractFunctions.cancelEvent(
        selectedEvent.id, 
        refundMode === RefundMode.AutoRefund ? 0 : 1
      );

      setCancellationProgress({
        step: 'processing_refunds',
        message: 'Event cancelled successfully. Updating status...',
        progress: 90,
        txHash
      });

      // Step 2: Refresh Data
      await loadAnalytics();

      setCancellationProgress({
        step: 'completed',
        message: 'Event cancellation complete!',
        progress: 100,
        txHash
      });

      setTimeout(() => {
        setShowCancelModal(false);
        setIsProcessing(false);
        setCancellationProgress(undefined);
        setSelectedEvent(null);
      }, 2000);

    } catch (error: any) {
      console.error('Error cancelling event:', error);
      alert(`Failed to cancel event: ${error.message}`);
      setIsProcessing(false);
      setCancellationProgress(undefined);
    }
  };

  // FIXED: Withdraw Logic with Frontend Validation and Toasts
  const handleWithdraw = async (event: AnalyticsEventData) => {
    // Frontend Check: Prevent 0 ETH withdrawal attempts
    if (parseFloat(event.revenue) <= 0) {
      setToast({ message: "No funds available to withdraw", type: "error" });
      return;
    }

    if (withdrawEventId !== null) return;
    setWithdrawEventId(event.id);

    try {
      await contractFunctions.withdraw(event.id);
      setToast({ message: "Withdrawal successful", type: "success" });
      await loadAnalytics(); // Refresh analytics to update the UI revenue/state
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);

      // Map contract error to user friendly message
      let msg = "Withdrawal failed";
      if (error.message.includes("No funds available")) msg = "No funds available to withdraw";
      if (error.message.includes("Contract underfunded")) msg = "Contract balance low. Contact admin.";

      setToast({ message: msg, type: "error" });
    } finally {
      // Reset state
      setWithdrawEventId(null);
    }
  };

  const downloadCSV = () => {
    if (!analytics) return;

    // Updated CSV Headers as requested
    const headers = ['Event Name', 'Date', 'Tickets Sold', 'Revenue (ETH)', 'Status'];

    const rows = analytics.events.map((e) => [
      `"${e.name}"`, // Quote name to handle commas
      e.dateString,
      e.ticketsSold,
      e.revenue,
      e.status === 0 ? 'Active' : e.status === 1 ? 'Cancelled' : e.status === 2 ? 'Postponed' : 'Completed'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ... [Keep chartData generation logic] ...
  const chartData = analytics?.events.map((e) => ({
    name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
    tickets: e.ticketsSold,
    revenue: parseFloat(e.revenue)
  })) || [];
  

  if (!walletAddress) return <div className="text-center p-12">Please connect wallet.</div>;
  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-10 h-10" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Cancel Event Modal */}
      {showCancelModal && selectedEvent && (
        <CancelEventModal
          eventName={selectedEvent.name}
          eventId={selectedEvent.id}
          totalTicketsSold={selectedEvent.maxTickets - selectedEvent.ticketsRemaining}
          onConfirm={handleCancelEvent}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedEvent(null);
            setIsProcessing(false);
          }}
          isProcessing={isProcessing}
          progress={cancellationProgress}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-black">Organizer Dashboard</h1>
        </div>
        <button onClick={downloadCSV} disabled={!analytics?.events.length} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ... [Keep existing stat cards structure] ... */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
           <div className="text-muted-foreground text-sm">Total Revenue</div>
           <div className="text-2xl font-bold">{analytics?.totalRevenue} ETH</div>
        </div>
        {/* ... etc ... */}
      </div>

      {/* Removed "Global Withdraw" button - It was incorrect logic */}
      
      {/* Charts Section ... [Keep existing charts code] ... */}
      {analytics?.events.length && (
         <div className="h-64 bg-card border rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8b5cf6" />
               </BarChart>
            </ResponsiveContainer>
         </div>
      )}

      {/* Events Table - The Core Fix */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b">
          <h3 className="font-bold text-lg">Event Performance & Actions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Sold</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analytics?.events.map((event) => {
                const isActive = event.status === 0;
                const isCancelled = event.status === 1;

                return (
                  <tr key={event.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{event.name}</td>
                    <td className="px-6 py-4">{event.ticketsSold} / {event.maxTickets}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{event.revenue} ETH</td>
                    <td className="px-6 py-4">
                      {isActive && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>}
                      {isCancelled && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Cancelled</span>}
                      {event.status === 3 && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Completed</span>}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {/* Cancel Button */}
                      {isActive && (
                        <button
                          onClick={() => {
                            // Reconstruct full Event object for modal
                            setSelectedEvent({
                              ...event,
                              date: event.dateString,
                              time: '', 
                              location: '', 
                              city: '', 
                              genre: '', 
                              imageUrl: '', 
                              description: '',
                              price: '0' // Not needed for ID check
                            } as Event);
                            setShowCancelModal(true);
                          }}
                          className="text-red-600 hover:bg-red-50 p-2 rounded border border-red-200"
                          title="Cancel Event"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {/* Withdraw Button - Per Event */}
                      {/* Only show if there is revenue AND (event is Active or Completed). 
                          If Cancelled + AutoRefund, contract balance is likely 0. 
                          If Cancelled + BuyerClaim, funds might be withdrawable if not claimed? 
                          Usually organizers can't withdraw on Cancelled events unless rules allow. 
                          Assuming standard flow: Withdraw available for sold tickets. */}
                      {!isCancelled && (
                        <button
                          onClick={() => handleWithdraw(event)}
                          disabled={withdrawEventId === event.id}
                          className="text-green-600 hover:bg-green-50 p-2 rounded border border-green-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Withdraw Revenue"
                        >
                          {withdrawEventId === event.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wallet className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}