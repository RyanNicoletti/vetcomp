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
};

export default adminService;
