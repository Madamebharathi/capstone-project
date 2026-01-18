export interface CreateLoanRequest {
  clientName: string;
  requestedAmount: number;
  proposedInterestRate: number;
  tenureMonths: number;
  loanType: string;
  financials: {
    revenue: number;
    ebitda: number;
    rating: string;
  };
}
