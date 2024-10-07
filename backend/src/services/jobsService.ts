import { Knex } from "knex";

interface JobQueryParams {
  jobTitleSearch?: string;
  companySearch?: string;
  locationSearch?: string;
  jobType?: string[];
}

export const jobsService = {
  getAll: async (db: Knex, params: JobQueryParams) => {
    const query = db("jobs").select("*");

    if (params.jobTitleSearch) {
      query.whereILike("title", `%${params.jobTitleSearch}%`);
    }

    if (params.companySearch) {
      query.whereILike("company", `%${params.companySearch}%`);
    }

    if (params.locationSearch) {
      query.whereILike("location", `%${params.locationSearch}%`);
    }

    if (params.jobType && params.jobType.length > 0) {
      query.whereIn("job_type", params.jobType);
    }

    return await query;
  },
};
