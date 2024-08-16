import knex from "../db/connection";
import { User } from "../schemas/userSchema";

const userService = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const user: User = await knex("users").where({ email }).first();
    return user;
  },
  create: async (email: string, hash: string): Promise<string> => {
    const userId: string = await knex("users")
      .insert({ email, password_hash: hash })
      .returning("id");
    return userId;
  },
};

export default userService;
