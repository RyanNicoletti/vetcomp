export interface JobRecord {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "relief";
  practice_type: string;
  salary_min: number;
  salary_max: number;
  sign_on_bonus: number | null;
  description: string;
  requirements: string | null;
  benefits: string | null;
  application_url: string | null;
  contact_email: string;
  posted_date: Date;
  expires_at: Date;
  status: "active" | "expired" | "draft";
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JobPost {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "relief";
  practiceType: string;
  salaryMin: number;
  salaryMax: number;
  signOnBonus: number | null;
  description: string;
  requirements: string | null;
  benefits: string | null;
  applicationUrl: string | null;
  contactEmail: string;
  postedDate: string;
  expiresAt: string;
  status: "active" | "expired" | "draft";
  isApproved: boolean;
}

export interface JobFilters {
  page: number;
  rowsPerPage: number;
  companySearch?: string;
  locationSearch?: string;
  practiceTypeFilter?: string[] | undefined;
  typeFilter?: string[] | undefined;
}

export interface JobFormData {
  id?: string;
  user_id?: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "relief";
  practiceType: string;
  salaryMin: number;
  salaryMax: number;
  signOnBonus?: number;
  description: string;
  requirements?: string;
  benefits?: string;
  applicationUrl?: string;
  contactEmail: string;
}

export interface PricingOption {
  id: string;
  months: number;
  price: number;
  description: string;
  savings?: string;
  monthlyEquivalent?: number;
}
