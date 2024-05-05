export interface Salary {
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
  total_compensation: string;
  gender: "male" | "female" | "non-binary" | null;
  user_id: number | null;
  is_verified: boolean | null;
  is_approved: boolean;
  created_at: string;
}
