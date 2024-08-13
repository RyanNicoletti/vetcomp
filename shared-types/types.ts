export interface ICompensation {
  id?: string;
  user_id?: string | null;
  company: string;
  location: string;
  title: string;
  is_specialist: boolean;
  specialization: string | null;
  type_of_practice: string | null;
  is_new_grad: boolean;
  years_of_experience: number;
  base_salary: number | null;
  hourly_rate: number | null;
  payment_frequency: "annually" | "hourly";
  sign_on_bonus: number | null;
  average_annual_production: number | null;
  percent_production: number | null;
  total_compensation: number | null;
  gender: "male" | "female" | "non-binary" | null;
  number_of_veterinarians: number | null;
  days_worked_per_week: number | null;
  email: string | null;
  is_verified: boolean;
  is_approved: boolean;
  verification_document: Uint8Array | null;
  verification_document_name: string | null;
  created_at?: string;
  updated_at?: string;
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
  paymentFrequency: "annually" | "hourly" | "";
  signOnBonus?: string;
  averageAnnualProduction?: string;
  percentProduction?: string;
  gender: "male" | "female" | "non-binary" | "";
  numberOfVeterinarians?: string;
  verificationDocument: Blob[] | null;
  verificationDocumentName?: string;
  daysWorkedPerWeek?: string;
  email?: string;
}
