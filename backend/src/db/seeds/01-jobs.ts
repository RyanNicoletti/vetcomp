// seeds/jobs.ts
import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("jobs").del();

  // Inserts seed entries
  await knex("jobs").insert([
    {
      job_title: "Associate Veterinarian",
      company: "Happy Paws Clinic",
      job_location: "New York, NY",
      job_type: "Full-time",
      tags: ["small-animal", "new-grad-friendly"],
      description:
        "Join our team of passionate veterinarians in a state-of-the-art clinic.",
      base_salary_min: 90000.0,
      base_salary_max: 120000.0,
      sign_on_bonus: 5000.0,
      percent_production: "20% after reaching $400,000 in production",
      retention_bonus: 10000.0,
      additional_compensation_notes: "CE allowance of $3000 per year",
      salary_frequency: "annually",
      additional_compensation: "Health insurance, 401(k) matching",
      applicant_collection_method: "email",
      application_email: "careers@happypawsclinic.com",
      is_approved: true,
    },
    {
      job_title: "Emergency Veterinarian",
      company: "24/7 Pet Hospital",
      job_location: "Los Angeles, CA",
      job_type: "Part-time",
      tags: ["emergency", "overnight-shifts"],
      description: "Seeking experienced emergency vets for overnight shifts.",
      base_salary_min: 100000.0,
      base_salary_max: 140000.0,
      sign_on_bonus: 10000.0,
      percent_production: "25% of production",
      salary_frequency: "annually",
      additional_compensation: "Shift differential for nights and weekends",
      applicant_collection_method: "external_website",
      external_website: "https://24-7pethospital.com/careers",
      is_approved: true,
    },
    {
      job_title: "Equine Specialist",
      company: "Countryside Veterinary Services",
      job_location: "Lexington, KY",
      job_type: "Full-time",
      tags: ["equine", "mobile-practice"],
      description:
        "Join our mobile equine practice serving Kentucky's horse country.",
      base_salary_min: 110000.0,
      base_salary_max: 150000.0,
      retention_bonus: 15000.0,
      additional_compensation_notes: "Vehicle provided for work use",
      salary_frequency: "annually",
      additional_compensation: "Profit sharing, paid time off",
      applicant_collection_method: "email",
      application_email: "jobs@countrysidevet.com",
      is_approved: false,
    },
  ]);
}
