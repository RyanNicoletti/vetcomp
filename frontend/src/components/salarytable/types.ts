export interface Salary {
  salaryId: number;
  company: string;
  title: string;
  typeOfPractice: string;
  isNewGrad: boolean;
  yearsOfExperience: number;
  location: string;
  baseSalary: number | null;
  hourlyRate: number | null;
  paymentFrequency: "annually" | "hourly";
  averageAnnualBonus: number | null;
  signOnBonus: number | null;
  averageAnnualProduction: number | null;
  percentProduction: number | null;
  totalCompensation: number;
  gender: "male" | "female" | "non-binary" | null;
  userId: number | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: number;
}

export interface SortParams {
  sortDirection: "asc" | "desc";
  sortBy: string;
}
