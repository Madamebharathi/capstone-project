export interface Financials {
  revenue: number;
  ebitda: number;
  rating: string;
}

export enum LoanType {
  TERM_LOAN = 'TERM_LOAN',
  WORKING_CAPITAL = 'WORKING_CAPITAL',
  OVERDRAFT = 'OVERDRAFT',
  SME_LOAN = 'SME_LOAN',
}

export enum LoanStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Loan {
  id: string;
  clientName: string;
  applicantEmail?: string; // optional, if backend sends it
  loanType: LoanType;
  requestedAmount: number;   // backend field
  proposedInterestRate: number;
  tenureMonths: number;
  financials?: Financials;
  status: LoanStatus;
  sanctionedAmount?: number;
  approvedInterestRate?: number;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  actions?: any[];
  deleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
}
