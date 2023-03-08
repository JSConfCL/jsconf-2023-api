// Obtenidos de: https://www.mercadopago.com.ar/developers/en/reference/payments/_payments_id/get
export type MercadoPagoPaymentResponseType = {
  id: number;
  status:
    | 'pending'
    | 'approved'
    | 'authorized'
    | 'in_process'
    | 'in_mediation'
    | 'rejected'
    | 'cancelled'
    | 'refunded'
    | 'charged_back';
  status_detail:
    | 'Accredited'
    | 'pending_contingency'
    | 'pending_review_manual'
    | 'cc_rejected_bad_filled_date'
    | 'cc_rejected_bad_filled_other'
    | 'cc_rejected_bad_filled_security_code'
    | 'cc_rejected_blacklist'
    | 'cc_rejected_call_for_authorize'
    | 'cc_rejected_card_disabled'
    | 'cc_rejected_duplicated_payment'
    | 'cc_rejected_high_risk'
    | 'cc_rejected_insufficient_amount'
    | 'cc_rejected_invalid_installments'
    | 'cc_rejected_max_attempts'
    | 'cc_rejected_other_reason';
  authorization_code: string;
  payer: {
    id: string;
    email: string;
    identification?: {
      type: string;
      number: string;
    };
    type: 'customer' | 'registered' | 'guest';
  };
  metadata: Record<string, string | number>;
  external_reference: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  transaction_details: {
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    external_resource_url: string;
    installment_amount: number;
    financial_institution: string;
    payment_method_reference_id: string;
    payable_deferral_period: string;
    acquirer_reference: string;
  };
  captured: boolean;
};
