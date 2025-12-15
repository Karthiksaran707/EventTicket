import { useState } from 'react';
import { X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { RefundMode, CancellationProgress } from '../types/events';

interface CancelEventModalProps {
  eventName: string;
  eventId: number;
  totalTicketsSold: number;
  onConfirm: (refundMode: RefundMode) => Promise<void>;
  onClose: () => void;
  isProcessing: boolean;
  progress?: CancellationProgress;
}

export function CancelEventModal({
  eventName,
  eventId,
  totalTicketsSold,
  onConfirm,
  onClose,
  isProcessing,
  progress
}: CancelEventModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  // Force Auto-Refund only - no choice for user
  const selectedRefundMode = RefundMode.AutoRefund;
  const [step, setStep] = useState<'warning' | 'confirmation'>('warning');

  const isConfirmationValid = confirmationText === 'CANCEL';

  const handleNext = () => {
    if (step === 'warning') {
      setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'confirmation') {
      setStep('warning');
    }
  };

  const handleConfirm = async () => {
    if (isConfirmationValid) {
      await onConfirm(selectedRefundMode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-white font-bold text-2xl">Cancel Event</h2>
              <p className="text-white/90 text-sm">{eventName}</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step Indicator */}
          {!isProcessing && (
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${step === 'warning' ? 'bg-red-500' : 'bg-green-500'}`} />
              <div className={`w-3 h-3 rounded-full ${step === 'confirmation' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            </div>
          )}

          {/* Warning Step */}
          {step === 'warning' && !isProcessing && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-red-800 dark:text-red-200 font-bold text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Warning: This Action Cannot Be Undone
                </h3>
                <ul className="space-y-2 text-red-700 dark:text-red-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>The event will be permanently cancelled and removed from active listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>All {totalTicketsSold} ticket holders will be automatically refunded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Refunds will be processed instantly via Auto-Refund mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>You will pay gas fees for all refund transactions (~{(totalTicketsSold * 0.001).toFixed(3)} ETH)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>This action is irreversible and will be recorded on the blockchain</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Event Details:</strong>
                  <br />• Event ID: #{eventId}
                  <br />• Tickets Sold: {totalTicketsSold}
                  <br />• Event Name: {eventName}
                  <br />• Refund Mode: Auto-Refund (Automatic)
                </p>
              </div>
            </div>
          )}


          {/* Confirmation Step */}
          {step === 'confirmation' && !isProcessing && (
            <div className="space-y-4">
              <div>
                <h3 className="text-card-foreground font-bold text-lg mb-2">Final Confirmation</h3>
                <p className="text-muted-foreground text-sm">
                  To proceed with cancellation, type <strong>CANCEL</strong> below
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>You are about to:</strong>
                  <br />• Cancel event: {eventName}
                  <br />• Refund mode: Auto-Refund (Instant & Automatic)
                  <br />• Tickets to refund: {totalTicketsSold}
                  <br />• Estimated gas cost: ~{(totalTicketsSold * 0.001).toFixed(3)} ETH
                </p>
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2 font-medium">
                  Type "CANCEL" to confirm
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                  placeholder="Type CANCEL"
                  className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && progress && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-card-foreground font-bold text-lg mb-2">
                  {progress.step === 'confirming' && 'Confirming Transaction...'}
                  {progress.step === 'cancelling' && 'Cancelling Event...'}
                  {progress.step === 'processing_refunds' && 'Processing Refunds...'}
                  {progress.step === 'completed' && 'Cancellation Complete!'}
                </h3>
                <p className="text-muted-foreground text-sm">{progress.message}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-purple-500 h-full transition-all duration-500"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <p className="text-center text-muted-foreground text-sm">
                {progress.progress}% Complete
              </p>

              {progress.refundsProcessed !== undefined && progress.totalRefunds !== undefined && (
                <p className="text-center text-muted-foreground text-sm">
                  Refunds Processed: {progress.refundsProcessed} / {progress.totalRefunds}
                </p>
              )}

              {progress.txHash && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-blue-800 dark:text-blue-200 text-xs">
                    <strong>Transaction Hash:</strong>
                    <br />
                    <code className="break-all">{progress.txHash}</code>
                  </p>
                </div>
              )}

              {progress.step === 'completed' && (
                <div className="text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
                  <p className="text-green-600 dark:text-green-400 font-bold">
                    Event cancelled successfully!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isProcessing && (
          <div className="bg-muted border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
            {step !== 'warning' && (
              <button
                onClick={handleBack}
                className="flex-1 bg-card border border-gray-200 dark:border-gray-700 text-card-foreground py-3 rounded-lg hover:bg-accent transition-colors font-semibold"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-card border border-gray-200 dark:border-gray-700 text-card-foreground py-3 rounded-lg hover:bg-accent transition-colors font-semibold"
            >
              Cancel
            </button>
            {step !== 'confirmation' ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!isConfirmationValid}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Confirm Cancellation
              </button>
            )}
          </div>
        )}

        {isProcessing && progress?.step === 'completed' && (
          <div className="bg-muted border-t border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
