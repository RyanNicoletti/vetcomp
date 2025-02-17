import { Knex } from "knex";
import b2Service from "./b2Service";

interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  resume_url?: string;
  resume_name?: string;
  status: "pending" | "viewed" | "contacted";
  created_at: Date;
  updated_at: Date;
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
          app.resume_url = await b2Service.getSignedUrl(app.resume_name);
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
      .where({ user_id: userId })
      .orderBy("created_at", "desc");

    return Promise.all(
      applications.map(async (app) => {
        if (app.resume_name) {
          app.resume_url = await b2Service.getSignedUrl(app.resume_name);
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
};

export default jobApplicationsService;
