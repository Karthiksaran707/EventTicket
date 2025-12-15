import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Filter, ExternalLink } from 'lucide-react';
import { RefundRequest, RefundStatus } from '../types/events';

interface RefundRequestQueueProps {
  requests: RefundRequest[];
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string, reason: string) => Promise<void>;
  isProcessing: boolean;
}

export function RefundRequestQueue({
  requests,
  onApprove,
  onReject,
  isProcessing
}: RefundRequestQueueProps) {
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'All'>('All');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredRequests = statusFilter === 'All'
    ? requests
    : requests.filter(req => req.status === statusFilter);

  const getStatusBadge = (status: RefundStatus) => {
    const badges = {
      [RefundStatus.None]: {
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        icon: <Clock className="w-4 h-4" />
      },
      [RefundStatus.Requested]: {
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        icon: <Clock className="w-4 h-4" />
      },
      [RefundStatus.Approved]: {
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        icon: <CheckCircle2 className="w-4 h-4" />
      },
      [RefundStatus.Refunded]: {
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        icon: <CheckCircle2 className="w-4 h-4" />
      },
      [RefundStatus.Rejected]: {
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        icon: <XCircle className="w-4 h-4" />
      }
    };

    const badge = badges[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  const handleReject = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (selectedRequestId && rejectionReason) {
      await onReject(selectedRequestId, rejectionReason);
      setShowRejectModal(false);
      setSelectedRequestId(null);
      setRejectionReason('');
    }
  };

  const statusCounts = {
    all: requests.length,
    requested: requests.filter(r => r.status === RefundStatus.Requested).length,
    approved: requests.filter(r => r.status === RefundStatus.Approved).length,
    refunded: requests.filter(r => r.status === RefundStatus.Refunded).length,
    rejected: requests.filter(r => r.status === RefundStatus.Rejected).length
  };

  return (
    <div className="space-y-6">
      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-red-500 p-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <XCircle className="w-6 h-6" />
                Reject Refund Request
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground text-sm">
                Please provide a reason for rejecting this refund request. This will be visible to the buyer.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Ticket already used, event not cancelled, etc."
                className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
                autoFocus
              />
            </div>
            <div className="bg-muted border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequestId(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-card border border-gray-200 dark:border-gray-700 text-card-foreground py-2 rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectionReason.trim() || isProcessing}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-card-foreground font-bold text-2xl mb-1">Refund Request Queue</h2>
          <p className="text-muted-foreground text-sm">Manage and process refund requests from buyers</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'All'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter(RefundStatus.Requested)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === RefundStatus.Requested
              ? 'bg-yellow-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          Pending ({statusCounts.requested})
        </button>
        <button
          onClick={() => setStatusFilter(RefundStatus.Approved)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === RefundStatus.Approved
              ? 'bg-blue-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          Approved ({statusCounts.approved})
        </button>
        <button
          onClick={() => setStatusFilter(RefundStatus.Refunded)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === RefundStatus.Refunded
              ? 'bg-green-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          Completed ({statusCounts.refunded})
        </button>
        <button
          onClick={() => setStatusFilter(RefundStatus.Rejected)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === RefundStatus.Rejected
              ? 'bg-red-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          Rejected ({statusCounts.rejected})
        </button>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <Filter className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-card-foreground font-bold text-lg mb-2">No Refund Requests</h3>
          <p className="text-muted-foreground">
            {statusFilter === 'All'
              ? 'There are no refund requests at this time.'
              : `No ${statusFilter.toLowerCase()} requests found.`}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Buyer Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs text-card-foreground font-mono">
                        {request.id.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-card-foreground font-mono">
                        {request.buyerAddress.substring(0, 6)}...{request.buyerAddress.substring(38)}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-card-foreground font-semibold">
                        {request.amount} ETH
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(request.requestedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {request.status === RefundStatus.Requested && (
                          <>
                            <button
                              onClick={() => onApprove(request.id)}
                              disabled={isProcessing}
                              className="bg-green-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={isProcessing}
                              className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === RefundStatus.Refunded && request.txHash && (
                          <a
                            href={`https://etherscan.io/tx/${request.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 text-xs flex items-center gap-1"
                          >
                            View Tx
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {request.status === RefundStatus.Rejected && request.rejectionReason && (
                          <button
                            className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                            title={request.rejectionReason}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            View Reason
                          </button>
                        )}
                        {request.status === RefundStatus.Approved && (
                          <span className="text-muted-foreground text-xs">Awaiting claim</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
