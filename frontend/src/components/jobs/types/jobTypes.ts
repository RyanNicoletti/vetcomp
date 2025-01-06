export interface JobFormData {
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

export interface PricingOption {
  id: string;
  months: number;
  price: number;
  description: string;
  monthlyEquivalent: number;
  savings?: string;
}

export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: "monthly",
    months: 1,
    price: 49,
    description: "Monthly",
    monthlyEquivalent: 49,
  },
  {
    id: "biannual",
    months: 6,
    price: 245,
    description: "6 months",
    monthlyEquivalent: 41,
    savings: "Save 16%",
  },
  {
    id: "annual",
    months: 12,
    price: 469,
    description: "12 months",
    monthlyEquivalent: 39,
    savings: "Save 20%",
  },
];

export interface JobsResponse {
  jobs: JobPost[];
  totalPages: number;
  currentPage: number;
}

export interface JobFilters {
  page: number;
  rowsPerPage: number;
  companySearch?: string;
  locationSearch?: string;
  practiceTypeFilter?: string[];
  typeFilter?: string[];
}

export interface JobsSortParams {
  sortDirection: string;
  sortBy: string;
}
