/**
 * Broadcast notification payloads sent via Laravel Echo/Reverb.
 * Matches the `toArray()` return of each Notification class in the API.
 * Keep in sync with `api/app/Notifications/*.php`.
 */
declare namespace Api.Broadcast {
  /** Common fields present on most broadcast notifications. */
  interface Base {
    type: string;
    action?: string;
    model?: string;
    translationKey?: string;
    translationParams?: Record<string, string>;
  }

  /** quote.sent */
  export interface QuoteSent extends Base {
    orderId: number;
    orderPublicId: string;
    quoteId: number;
    quoteTotal: number;
    quoteCurrency: string;
  }

  /** quote.expired */
  export interface QuoteExpired extends Base {
    orderId: number;
    orderPublicId: string;
    quoteId: number;
    quoteVersion: number;
    isFinalCancellation: boolean;
  }

  /** quote.requested */
  export interface QuoteRequested extends Base {
    modelId: number;
    modelName: string;
    orderId: number;
    orderPublicId: string;
  }

  /** order.confirmed */
  export interface OrderConfirmed extends Base {
    orderId: number;
    orderPublicId: string;
  }

  /** order.cancelled */
  export interface OrderCancelled extends Base {
    orderId: number;
    orderPublicId: string;
    refundAmount: number | null;
    cancelFee: number | null;
  }

  /** order.pending_approval */
  export interface OrderPendingApproval extends Base {
    modelId: number;
    modelName: string;
    orderId: number;
    orderPublicId: string;
  }

  /** order.updated */
  export interface OrderUpdated extends Base {
    modelId: number | null;
    modelName: string | null;
  }

  /** delivery.completed */
  export interface DeliveryCompleted extends Base {
    orderId: number;
    orderPublicId: string;
  }

  /** stop.assigned */
  export interface StopAssigned extends Base {
    modelId: number;
    stopId: number;
    orderId: number;
    stopType: string;
    routeDate: string;
  }

  /** stop.failed */
  export interface StopFailed extends Base {
    modelId: number;
    stopId: number;
    orderId: number;
    driverName: string;
    reason: string;
    routeDate: string;
  }

  /** stop.delay_flagged */
  export interface StopDelayFlagged extends Base {
    modelId: number;
    stopId: number;
    orderId: number;
    driverName: string;
    reason: string;
    routeDate: string;
  }

  /** schedule.changed */
  export interface ScheduleChanged extends Base {
    orderPublicId: string;
    stopType: string;
    oldTime: string | null;
    newTime: string | null;
    reason: string;
  }

  /** chat.message_received */
  export interface ChatMessageReceived extends Base {
    orderId: number;
    orderPublicId: string;
    senderName: string;
  }

  /** payment.receipt */
  export interface PaymentReceipt extends Base {
    orderId: number;
    orderPublicId: string;
    paymentId: number;
    amount: number;
    currency: string;
    invoicePublicId: string | null;
  }

  /** final.receipt */
  export interface FinalReceipt extends Base {
    orderId: number;
    orderPublicId: string;
    invoicePublicId: string;
    amount: number;
    currency: string;
  }

  /** surcharge.receipt */
  export interface SurchargeReceipt extends Base {
    orderId: number;
    orderPublicId: string;
    invoicePublicId: string;
    amount: number;
    currency: string;
  }

  /** refund.receipt */
  export interface RefundReceipt extends Base {
    orderId: number;
    orderPublicId: string;
    invoicePublicId: string;
    amount: number;
    currency: string;
  }

  /** payment.failed */
  export interface PaymentFailed extends Base {
    orderId: number;
    orderPublicId: string;
  }

  /** catalog.updated */
  export interface CatalogUpdated extends Base {
    modelId: number | null;
    modelName: string | null;
    catalogId: number | null;
  }

  /** user.updated / driver.updated / business.updated */
  export interface EntityUpdated extends Base {
    modelId: number | null;
    modelPublicId: string | null;
    modelName: string | null;
  }

  /** unassigned_order.escalation */
  export interface UnassignedOrderEscalation extends Base {
    orderId: number;
    orderPublicId: string;
    workingHoursUnassigned: number;
  }

  /** refund-request.created */
  export interface RefundRequestCreated extends Base {
    orderId: number;
    orderPublicId: string;
    refundRequestId: number;
    refundRequestPublicId: string;
    reason: string;
    customerName: string;
  }

  /** refund-request.resolved */
  export interface RefundRequestResolved extends Base {
    orderId: number;
    orderPublicId: string;
    refundRequestId: number;
    refundRequestPublicId: string;
    status: string;
    adminNotes: string | null;
    /** How it was settled — a card reversal or account balance. Null when denied. */
    refundMethod: string | null;
    refundAmount: number | null;
  }

  /** refund.due */
  export interface RefundDue extends Base {
    orderId: number;
    orderPublicId: string;
    refundRequestId: number;
    refundRequestPublicId: string;
    /** What we owe, in the order's currency. */
    amount: number;
    currency: string;
  }

  /** balance.credited */
  export interface BalanceCredited extends Base {
    balanceEntryId: number;
    balanceEntryPublicId: string;
    /** Signed, in base currency. Positive for a grant. */
    amount: number;
    /** The owner's balance after this entry, in base currency. */
    balance: number;
    notes: string | null;
  }

  /** settlement.charged */
  export interface SettlementCharged extends Base {
    settlementId: number;
    settlementPublicId: string;
    /** What the period's deliveries came to, gross, in base currency. */
    amount: number;
    /** How much of `amount` the account's own credit covered. */
    creditApplied: number;
    /** What actually left the card: `amount - creditApplied`. */
    charged: number;
    currency: string;
    cutoffAt: string;
  }

  /** settlement.failed */
  export interface SettlementFailed extends Base {
    settlementId: number;
    settlementPublicId: string;
    /** The figure the card was asked for, net of any credit applied. */
    amount: number;
    currency: string;
    /** When the account stops being able to order if this is still unpaid. */
    blockedFrom: string;
  }

  /** settlement.block_warning */
  export interface SettlementBlockWarning extends Base {
    settlementId: number;
    settlementPublicId: string;
    amount: number;
    currency: string;
    blockedFrom: string;
  }

  /** Union of all broadcast notification payloads. */
  export type AnyNotification =
    | QuoteSent
    | QuoteExpired
    | QuoteRequested
    | OrderConfirmed
    | OrderCancelled
    | OrderPendingApproval
    | OrderUpdated
    | DeliveryCompleted
    | StopAssigned
    | StopFailed
    | StopDelayFlagged
    | ScheduleChanged
    | ChatMessageReceived
    | PaymentReceipt
    | FinalReceipt
    | SurchargeReceipt
    | RefundReceipt
    | PaymentFailed
    | CatalogUpdated
    | EntityUpdated
    | UnassignedOrderEscalation
    | RefundRequestCreated
    | RefundRequestResolved
    | BalanceCredited
    | RefundDue
    | SettlementCharged
    | SettlementFailed
    | SettlementBlockWarning;
}
