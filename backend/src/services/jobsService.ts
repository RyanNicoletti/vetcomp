import { Knex } from "knex";
import { JobFilters, JobPost, JobRecord } from "../types/jobsTypes";

const transformRecordToJob = (record: JobRecord): JobPost => ({
  id: record.id,
  userId: record.user_id,
  title: record.title,
  company: record.company,
  location: record.location,
  type: record.type,
  practiceType: record.practice_type,
  salaryMin: record.salary_min,
  salaryMax: record.salary_max,
  signOnBonus: record.sign_on_bonus,
  description: record.description,
  requirements: record.requirements,
  benefits: record.benefits,
  applicationUrl: record.application_url,
  contactEmail: record.contact_email,
  postedDate: record.posted_date.toISOString(),
  expiresAt: record.expires_at.toISOString(),
  status: record.status,
  isApproved: record.is_approved,
});

const jobsService = {
  getAllApprovedJobs: async (db: Knex, filters: JobFilters) => {
    const query = db<JobRecord>("jobs")
      .select("*", db.raw("COUNT(*) OVER() as total_count"))
      .where({
        status: "active",
        is_approved: true,
      });

    if (filters.companySearch) {
      query.whereILike("company", `%${filters.companySearch}%`);
    }

    if (filters.locationSearch) {
      query.whereILike("location", `%${filters.locationSearch}%`);
    }

    if (filters.typeFilter?.length) {
      query.whereIn("type", filters.typeFilter);
    }

    if (filters.practiceTypeFilter?.length) {
      console.log("here", filters.practiceTypeFilter);
      query.whereIn("practice_type", filters.practiceTypeFilter);
    }

    const page = filters.page || 1;
    const pageSize = filters.rowsPerPage || 10;
    const offset = (page - 1) * pageSize;

    query.orderBy("posted_date", "desc").offset(offset).limit(pageSize);

    const jobs = await query;
    const totalCount = jobs.length > 0 ? Number(jobs[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      jobs: jobs.map(transformRecordToJob),
      currentPage: page,
      totalPages,
    };
  },

  getAllUnapprovedJobs: async (db: Knex, filters: JobFilters) => {
    const query = db<JobRecord>("jobs")
      .select("*", db.raw("COUNT(*) OVER() as total_count"))
      .where({ is_approved: false });

    if (filters.companySearch) {
      query.whereILike("company", `%${filters.companySearch}%`);
    }

    if (filters.locationSearch) {
      query.whereILike("location", `%${filters.locationSearch}%`);
    }

    if (filters.typeFilter?.length) {
      query.whereIn("type", filters.typeFilter);
    }

    if (filters.practiceTypeFilter?.length) {
      query.whereIn("practice_type", filters.practiceTypeFilter);
    }

    const page = filters.page || 1;
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    query.orderBy("posted_date", "desc").offset(offset).limit(pageSize);
    const jobs = await query;
    const totalCount = jobs.length > 0 ? Number(jobs[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      jobs: jobs.map((job) => ({
        ...job,
        postedDate: job.posted_date.toISOString(),
        expiresAt: job.expires_at.toISOString(),
      })),
      currentPage: page,
      totalPages,
    };
  },

  approveJob: async (db: Knex, jobId: string) => {
    const [job] = await db<JobRecord>("jobs")
      .where({ id: jobId })
      .update({ is_approved: true })
      .returning("*");

    return {
      ...job,
      postedDate: job.posted_date.toISOString(),
      expiresAt: job.expires_at.toISOString(),
    };
  },

  create: async (db: Knex, jobData: Partial<JobRecord>) => {
    const [job] = await db<JobRecord>("jobs")
      .insert({
        ...jobData,
        expires_at: db.raw("NOW() + INTERVAL '30 days'"), // Default to 30 days
      })
      .returning("*");

    return {
      ...job,
      postedDate: job.posted_date.toISOString(),
      expiresAt: job.expires_at.toISOString(),
    };
  },

  getById: async (db: Knex, id: string) => {
    const job = await db<JobRecord>("jobs").where({ id }).first();
    if (!job) return null;

    return {
      ...job,
      postedDate: job.posted_date.toISOString(),
      expiresAt: job.expires_at.toISOString(),
    };
  },
};

export default jobsService;
