import { Knex } from "knex";
import { ICompensation } from "../../../shared-types/types";

interface UserWithCompensations {
  id: string;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: Date;
  compensations: ICompensation[];
}

const adminService = {
  getUsersWithCompensations: async (
    db: Knex
  ): Promise<UserWithCompensations[]> => {
    const usersQuery = await db("users")
      .select(
        "users.id",
        "users.email",
        "users.is_verified",
        "users.is_admin",
        "users.created_at"
      )
      .orderBy("users.created_at", "desc");

    const usersWithCompensations = await Promise.all(
      usersQuery.map(async (user) => {
        const compensations = await db("salaries")
          .select("*")
          .where({ user_id: user.id })
          .orderBy("created_at", "desc");

        return {
          ...user,
          compensations: compensations || [],
        };
      })
    );

    return usersWithCompensations;
  },

  getAllJobsWithUsers: async (db: Knex) => {
    return db("jobs")
      .join("users", "jobs.user_id", "users.id")
      .select("jobs.*", "users.email as user_email")
      .orderBy("jobs.created_at", "desc");
  },

  deleteJobById: async (db: Knex, jobId: string): Promise<void> => {
    await db("jobs").where({ id: jobId }).del();
  },
};

export default adminService;
