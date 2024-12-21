// src/services/jobsService.ts

import { Knex } from "knex";
import { JobRecord } from "../types/jobsTypes";

interface JobFilters {
  page: number;
  searchTerm?: string;
  practiceType?: string;
  locationType?: string;
}

const jobsService = {
  getAll: async (db: Knex, filters: JobFilters) => {
    const query = db<JobRecord>("jobs")
      .select("*", db.raw("COUNT(*) OVER() as total_count"))
      .where({
        status: "active",
        is_approved: true,
      });

    // Add search filters
    if (filters.searchTerm) {
      query.where((builder) => {
        builder
          .whereILike("title", `%${filters.searchTerm}%`)
          .orWhereILike("company", `%${filters.searchTerm}%`)
          .orWhereILike("description", `%${filters.searchTerm}%`);
      });
    }

    if (filters.practiceType) {
      query.whereILike("practice_type", `%${filters.practiceType}%`);
    }

    if (filters.locationType) {
      query.whereILike("location", `%${filters.locationType}%`);
    }

    // Pagination
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
