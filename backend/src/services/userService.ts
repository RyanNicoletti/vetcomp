import { randomBytes } from "crypto";
import knex from "../db/connection";
import { User } from "../schemas/userSchema";
import { redisClient } from "../../config/redisConfig";
import * as argon2 from "argon2";

const userService = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const user: User = await knex("users").where({ email }).first();
    return user;
  },
  create: async (email: string, hash: string): Promise<string> => {
    const [userId] = await knex("users")
      .insert({ email, password_hash: hash, is_verified: false })
      .returning("id");
    return userId.id;
  },
  generateVerificationCode: async (userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      randomBytes(2, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          const code = buffer.toString("hex").toUpperCase();
          redisClient
            .set(`verify:${userId}`, code, { EX: 15 * 60 }) // 15 minutes expiry
            .then(() => resolve(code))
            .catch(reject);
        }
      });
    });
  },
  verifyEmail: async (userId: string, code: string): Promise<boolean> => {
    const storedCode = await redisClient.get(`verify:${userId}`);
    if (storedCode && storedCode === code) {
      await knex("users").where({ id: userId }).update({ is_verified: true });
      await redisClient.del(`verify:${userId}`);
      return true;
    }
    return false;
  },

  login: async (email: string, password: string): Promise<User | null> => {
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return null;
    }
    const isValidPassword = await argon2.verify(user.password_hash, password);
    if (!isValidPassword) {
      return null;
    }
    return user;
  },
};

export default userService;
