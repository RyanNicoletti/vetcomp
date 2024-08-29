import { randomBytes } from "crypto";
import knex from "../db/connection";
import { User } from "../schemas/userSchema";
import { redisClient } from "../../config/redisConfig";
import * as argon2 from "argon2";
import { UserLogin } from "../schemas/loginSchema";

const userService = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const user: User = await knex("users").where({ email }).first();
    return user;
  },
  createUnverifiedTempUser: async (
    email: string,
    password: string
  ): Promise<string> => {
    const hashedPassword = await argon2.hash(password);
    const [userId] = await knex("email_verifications")
      .insert({
        email,
        password_hash: hashedPassword,
      })
      .returning("id");

    return userId.id;
  },
  create: async (email: string, hash: string) => {
    const [userId] = await knex("users")
      .insert({ email, password_hash: hash, is_verified: false })
      .returning("id");
    return userId.id;
  },

  createWithNullPassword: async (email: string) => {
    const [userId] = await knex("users")
      .insert({ email, password_hash: null, is_verified: false })
      .returning("id");
    return userId;
  },

  updatePassword: async (
    userId: string,
    hashedPassword: string
  ): Promise<void> => {
    await knex("users")
      .where({ id: userId })
      .update({ password_hash: hashedPassword });
  },

  generateVerificationCode: async (
    userId: string,
    email: string,
    password: string
  ): Promise<string> => {
    const passwordHash = await argon2.hash(password);
    const code = randomBytes(3).toString("hex").toUpperCase();
    const existingTempUser = await knex("email_verifications")
      .where({ id: userId })
      .first();
    if (existingTempUser) {
      await knex("email_verifications")
        .where({ id: userId })
        .update({
          verification_code: code,
          expires_at: knex.raw("NOW() + INTERVAL '15 minutes'"),
        });
    } else {
      await knex("email_verifications").insert({
        id: userId,
        email,
        verification_code: code,
        password_hash: passwordHash,
        expires_at: knex.raw("NOW() + INTERVAL '15 minutes'"),
      });
    }

    return code;
  },

  verifyEmail: async (
    token: string,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
    isNewUser?: boolean;
    userId?: string;
  }> => {
    const userId = await redisClient.get(`verify_token:${token}`);
    if (!userId) {
      return { success: false, message: "Invalid or expired token" };
    }

    const tempUser = await knex("email_verifications")
      .where({ id: userId, verification_code: code })
      .first();

    if (!tempUser) {
      return {
        success: false,
        message: "Verification code expired or invalid",
      };
    }

    if (tempUser.expires_at < new Date()) {
      await knex("email_verifications").where({ id: tempUser.id }).del();
      return { success: false, message: "Verification code has expired" };
    }

    const user = await knex("users").where({ id: userId }).first();
    let isNewUser;
    if (user) {
      isNewUser = false;
      await knex.transaction(async (trx) => {
        await trx("users").where({ id: userId }).update({
          is_verified: true,
          password_hash: tempUser.hashed_password,
        });
      });
    } else {
      isNewUser = true;
      await knex("users").insert({
        id: userId,
        email: tempUser.email,
        password_hash: tempUser.password_hash,
        is_verified: true,
      });
    }
    await knex("email_verifications").where({ id: tempUser.id }).del();
    await redisClient.del(`verify_token:${token}`);

    return {
      success: true,
      message: isNewUser
        ? "New user verified and activated successfully"
        : "Existing user verified successfully",
      isNewUser,
      userId,
    };
  },

  login: async (loginInput: UserLogin): Promise<User | null> => {
    const { email, password } = loginInput;
    const user: User | undefined = await knex<User>("users")
      .where({ email })
      .first();

    if (!user) {
      return null;
    }

    if (user.password_hash) {
      const isValidPassword: boolean = await argon2.verify(
        user.password_hash,
        password
      );
      if (!isValidPassword) {
        return null;
      }
    }

    return user;
  },

  getAdminStatusById: async (id: string): Promise<boolean> => {
    const adminStatus = await knex("users").where({ id }).returning("is_admin");
    const isAdmin: boolean = adminStatus[0].is_admin;
    return isAdmin;
  },
};

export default userService;
