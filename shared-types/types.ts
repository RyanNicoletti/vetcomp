// represents what is stored in the db
export interface ICompensation {
  id: string;
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
  verification_document_url: string | undefined;
  verification_document_name: string | null;
  verification_document_original_name: string | undefined;
  needs_review: boolean;
  is_practice_owner: boolean;
  practice_description: string | null;
  is_traveling: boolean;
  travel_notes: string | null;
  created_at?: Date;
  updated_at?: Date;
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
  verificationDocument: any;
  verificationDocumentName?: string;
  daysWorkedPerWeek?: string;
  email?: string;
  isPracticeOwner: boolean;
  practiceDescription: string | null;
  isTraveling: boolean;
  travelNotes: string | null;
}
