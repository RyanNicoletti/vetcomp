export interface ICompensation {
  salary_id: number;
  company: string;
  title: string;
  type_of_practice?: string;
  is_specialist: boolean;
  specialization?: string;
  is_new_grad: boolean;
  years_of_experience: number;
  location: string;
  base_salary: number | null;
  hourly_rate: number | null;
  payment_frequency: "annually" | "hourly";
  average_annual_bonus: number | null;
  sign_on_bonus: number | null;
  average_annual_production: number | null;
  percent_production: number | null;
  total_compensation: number | null;
  gender: "male" | "female" | "non-binary" | null;
  user_id: number | null;
  is_verified: boolean | null;
  is_approved: boolean;
  days_worked_per_week: number;
  number_of_veterinarians: number;
  email: string;
  created_at: string;
}

export interface CompensationDetailsWithPages {
  compensations: ICompensation[];
  pages: number;
}

export interface ICompFormInput {
  company: string;
  title: string;
  typeOfPractice?: string;
  isSpecialist: boolean;
  specialization?: string;
  isNewGrad: boolean;
  yearsOfExperience: string;
  location: string;
  baseSalary?: string;
  hourlyRate?: string;
  paymentFrequency: string;
  signOnBonus?: string;
  averageAnnualProduction?: string;
  percentProduction?: string;
  gender: "male" | "female" | "non-binary" | "";
  numberOfVeterinarians: string;
  verificationDocument: Blob[] | null;
  verificationDocumentName?: string;
  daysWorkedPerWeek?: string;
  email?: string;
}
