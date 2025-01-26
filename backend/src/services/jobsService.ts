import { Knex } from "knex";
import { JobFilters, JobPost, JobRecord } from "../types/jobsTypes";
import { JobSchema, StripeJobInput } from "../schemas/jobSchemas";

const jobsService = {
  getAllJobs: async (db: Knex, filters: JobFilters) => {
    const query = db<JobRecord>("jobs")
      .select("*", db.raw("COUNT(*) OVER() as total_count"))
      .where({
        status: "active",
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

    query.orderBy("created_at", "desc").offset(offset).limit(pageSize);

    const jobs = await query;
    const totalCount = jobs.length > 0 ? Number(jobs[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      jobs,
      currentPage: page,
      totalPages,
    };
  },

  create: async (db: Knex, jobData: StripeJobInput): Promise<JobRecord> => {
    const [job] = await db("jobs").insert(jobData).returning("*");
    return JobSchema.parse(job);
  },

  getById: async (db: Knex, id: string) => {
    const job = await db<JobRecord>("jobs").where({ id }).first();
    if (!job) return null;

    return { job };
  },
};

export default jobsService;
