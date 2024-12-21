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
