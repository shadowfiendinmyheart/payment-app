export interface PaymentFields {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  amount: string;
}

export interface PaymentResponse {
  requestId: string;
  amount: number;
}
