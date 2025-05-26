import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex.raw("TRUNCATE TABLE jobs RESTART IDENTITY CASCADE");

  await knex("jobs").insert([
    {
      title: "Associate Veterinarian",
      company: "VCA Animal Hospitals",
      location: "San Francisco, CA",
      type: "full-time",
      practice_type: "Small animal",
      salary_min: 120000,
      salary_max: 160000,
      sign_on_bonus: 20000,
      experience_min: 2,
      experience_max: 5,
      description: "Join our team of passionate veterinary professionals...",
      requirements: "DVM or equivalent degree, CA state license",
      benefits: "Competitive salary, health insurance, 401k, CE allowance",
      status: "active",
      application_method: "email",
      contact_email: "careers@vcasf.com",
    },
    {
      title: "Emergency Veterinarian",
      company: "BluePearl Specialty + Emergency Pet Hospital",
      location: "New York, NY",
      type: "full-time",
      practice_type: "Emergency",
      salary_min: 150000,
      salary_max: 200000,
      sign_on_bonus: 30000,
      experience_min: 3,
      experience_max: 10,
      description: "Looking for an experienced emergency veterinarian...",
      requirements: "Minimum 2 years emergency experience",
      benefits: "Competitive compensation package",
      status: "active",
      application_method: "external",
      application_url: "https://careers.bluepearl.com/jobs/emergency-vet-ny",
    },
  ]);
}
