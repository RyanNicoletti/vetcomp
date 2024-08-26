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
  createTemporaryUser: async (email: string, password: string) => {
    const hashedPassword = await argon2.hash(password);
    const [userId] = await knex("users")
      .insert({
        email,
        password_hash: hashedPassword,
        is_verified: false,
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
    email: string
  ): Promise<string> => {
    const code = randomBytes(2).toString("hex").toUpperCase();

    await knex("email_verifications").insert({
      user_id: userId,
      email,
      verification_code: code,
      expires_at: knex.raw("NOW() + INTERVAL '15 minutes'"),
    });

    return code;
  },

  verifyEmailAndActivateUser: async (
    userId: string,
    code: string
  ): Promise<{ success: boolean; message: string; isNewUser?: boolean }> => {
    const verification = await knex("email_verifications")
      .where({ user_id: userId, verification_code: code })
      .first();

    if (!verification) {
      return {
        success: false,
        message: "Verification code expired or invalid",
      };
    }

    if (verification.expires_at < new Date()) {
      await knex("email_verifications").where({ id: verification.id }).del();
      return { success: false, message: "Verification code has expired" };
    }

    const user = await knex("users").where({ id: userId }).first();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    let isNewUser = false;

    await knex.transaction(async (trx) => {
      if (!user.is_verified) {
        await trx("users").where({ id: userId }).update({ is_verified: true });
        isNewUser = true;
      }

      await trx("email_verifications").where({ id: verification.id }).del();
    });

    return {
      success: true,
      message: isNewUser
        ? "New user verified and activated successfully"
        : "Existing user verified successfully",
      isNewUser,
    };
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
};

export default userService;
