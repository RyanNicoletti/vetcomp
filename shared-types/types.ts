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
  needs_review: boolean;
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
}

export interface BaseJob {
  title: string;
  company: string;
  location: string;
  type: JobType;
  practiceType: string;
  salaryMin: number;
  salaryMax: number;
  signOnBonus?: number | null;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  applicationMethod: ApplicationMethod;
  contactEmail?: string | null;
  applicationUrl?: string | null;
}

export type JobType = "full-time" | "part-time" | "contract" | "relief";
export type ApplicationMethod = "email" | "external";
export type JobStatus = "active" | "expired" | "draft";

export interface IJobFormData {
  title: string;
  company: string;
  location: string;
  type: JobType;
  practiceType: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  applicationMethod: ApplicationMethod;
  contactEmail?: string | null;
  applicationUrl?: string | null;
  signOnBonus?: string | number;
  requirements?: string;
  benefits?: string;
  experienceMin?: string | number;
  experienceMax?: string | number;
}

export interface JobRecord {
  title: string;
  company: string;
  location: string;
  type: JobType;
  practice_type: string;
  experience_min: number;
  experience_max: number;
  salary_min: number;
  salary_max: number;
  sign_on_bonus?: number | null;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  application_method: ApplicationMethod;
  contact_email?: string | null;
  application_url?: string | null;
  user_id: string;
  status: JobStatus;
  subscription_id: string;
  customer_id: string;
}

export interface JobResponse {
  jobs: JobRecord[];
  totalPages: number;
  currentPage: number;
}
