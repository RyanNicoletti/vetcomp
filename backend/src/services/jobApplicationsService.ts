import { Knex } from "knex";
import b2Service from "./b2Service";

interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  resume_original_name: string | undefined;
  resume_url?: string;
  resume_name?: string;
  status: "applied" | "viewed" | "contacted";
  created_at: Date;
  updated_at: Date;

  job_title?: string;
  company?: string;
  location?: string;
}

const jobApplicationsService = {
  create: async (
    db: Knex,
    application: Omit<JobApplication, "id" | "created_at" | "updated_at">
  ): Promise<JobApplication> => {
    const [newApplication] = await db("job_applications")
      .insert(application)
      .returning("*");
    return newApplication;
  },

  getApplicationsByJobId: async (
    db: Knex,
    jobId: string
  ): Promise<JobApplication[]> => {
    const applications = await db("job_applications")
      .where({ job_id: jobId })
      .orderBy("created_at", "desc");

    return Promise.all(
      applications.map(async (app) => {
        if (app.resume_name) {
          app.resume_url = `/jobs/applications/resume/${app.resume_name}`;
        }
        return app;
      })
    );
  },

  getApplicationsByUserId: async (
    db: Knex,
    userId: string
  ): Promise<JobApplication[]> => {
    const applications = await db("job_applications")
      .join("jobs", "job_applications.job_id", "jobs.id")
      .where({ "job_applications.user_id": userId })
      .select(
        "job_applications.*",
        "jobs.title as job_title",
        "jobs.company",
        "jobs.location"
      )
      .orderBy("job_applications.created_at", "desc");

    return Promise.all(
      applications.map(async (app) => {
        if (app.resume_name) {
          app.resume_url = `/jobs/applications/resume/${app.resume_name}`;
        }
        return app;
      })
    );
  },
  updateApplicationStatus: async (
    db: Knex,
    applicationId: string,
    status: JobApplication["status"]
  ): Promise<JobApplication> => {
    const [updatedApplication] = await db("job_applications")
      .where({ id: applicationId })
      .update({ status })
      .returning("*");
    return updatedApplication;
  },

  deleteApplication: async (
    db: Knex,
    applicationId: string,
    userId: string
  ): Promise<boolean> => {
    const application = await db("job_applications")
      .where({ id: applicationId, user_id: userId })
      .first();

    if (!application) {
      return false;
    }

    const deletedCount = await db("job_applications")
      .where({ id: applicationId })
      .del();

    return deletedCount > 0;
  },

  verifyApplicationOwnership: async (
    db: Knex,
    applicationId: string,
    userId: string
  ): Promise<boolean> => {
    const application = await db("job_applications")
      .where({ id: applicationId, user_id: userId })
      .first();

    return !!application;
  },

  getUserApplicationsCount: async (
    db: Knex,
    userId: string
  ): Promise<number> => {
    const result = await db("job_applications")
      .where({ user_id: userId })
      .count("id as count")
      .first();

    return parseInt(result?.count as string) || 0;
  },
};

export default jobApplicationsService;
