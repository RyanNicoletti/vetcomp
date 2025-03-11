import { JobRecord } from "../../../../shared-types/types";

export interface ApplicationEmailParams {
  to: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
}

export interface NotificationEmailParams {
  to: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
}

export interface PaymentFailedParams {
  email: string;
  jobTitle: string;
  company: string;
  invoiceUrl?: string | null | undefined;
}

export interface UpcomingInvoiceParams {
  email: string;
  jobTitle: string;
  amount: number;
  dueDate: Date;
}

export interface RenewalConfirmationParams {
  email: string;
  jobTitle: string;
  amount: number;
  nextRenewal: Date;
}

export interface JobPostConfirmationParams {
  email: string;
  jobDetails: JobRecord;
  subscriptionDetails: {
    amount: number;
    interval: string;
  };
}

export interface ApplicationEmailParams {
  to: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
}

export interface NotificationEmailParams {
  to: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
}
