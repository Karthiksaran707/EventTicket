// Event and Refund Type Definitions

export enum EventStatus {
  Active = 0,
  Cancelled = 1,
  Postponed = 2,
  Completed = 3
}

export enum RefundStatus {
  None = 'None',
  Requested = 'Requested',
  Approved = 'Approved',
  Refunded = 'Refunded',
  Rejected = 'Rejected'
}

export enum RefundMode {
  AutoRefund = 'AutoRefund',
  BuyerClaim = 'BuyerClaim'
}

export interface RefundRequest {
  id: string;
  eventId: number;
  buyerAddress: string;
  ticketTokenId: string;
  amount: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
  txHash?: string;
  rejectionReason?: string;
}

export interface CancellationProgress {
  step: 'confirming' | 'cancelling' | 'processing_refunds' | 'completed';
  txHash?: string;
  message: string;
  progress: number; // 0-100
  refundsProcessed?: number;
  totalRefunds?: number;
}
