export interface CompensationDetail {
  salary_id: number;
  company: string;
  title: string;
  type_of_practice: string;
  is_new_grad: boolean | null;
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
  email: string;
  created_at: string;
}

export interface CompensationDetailsWithPages {
  compensations: CompensationDetail[];
  pages: number;
}
