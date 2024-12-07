export interface JobPosting {
  id: string;
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
  postedDate: string;
  expiresAt: string;
  status: "active" | "expired" | "draft";
}

export interface PricingOption {
  id: string;
  months: number;
  price: number;
  description: string;
  savings?: number;
}

export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: "monthly",
    months: 1,
    price: 199,
    description: "Monthly posting",
  },
  {
    id: "biannual",
    months: 6,
    price: 999,
    description: "6 months posting",
    savings: 195, // (199 * 6) - 999
  },
  {
    id: "annual",
    months: 12,
    price: 1799,
    description: "12 months posting",
    savings: 589, // (199 * 12) - 1799
  },
];
