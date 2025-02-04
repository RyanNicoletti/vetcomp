import { Knex } from "knex";
import { JobRecord } from "../../../shared-types/types";

const jobsService = {
  getAllJobs: async (db: Knex, filters: any) => {
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

  create: async (db: Knex, jobData: JobRecord): Promise<JobRecord> => {
    const [job] = await db("jobs").insert(jobData).returning("*");
    return job;
  },

  getUserJobs: async (db: Knex, userId: string): Promise<JobRecord[]> => {
    return db<JobRecord>("jobs")
      .where({ user_id: userId })
      .where({
        status: "active",
      })
      .orderBy("created_at", "desc");
  },

  getById: async (
    db: Knex,
    jobId: string,
    userId: string
  ): Promise<JobRecord | null> => {
    const job = await db<JobRecord>("jobs")
      .where({ id: jobId, user_id: userId })
      .first();
    return job || null;
  },
};

export default jobsService;
