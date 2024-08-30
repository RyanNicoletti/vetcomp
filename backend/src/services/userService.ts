import { randomBytes } from "crypto";
import { User } from "../schemas/userSchema";
import { redisClient } from "../../config/redisConfig";
import * as argon2 from "argon2";
import { UserLogin } from "../schemas/loginSchema";
import { Knex } from "knex";

const userService = {
  findByEmail: async (db: Knex, email: string): Promise<User | undefined> => {
    const user = await db("users").where({ email }).first();
    return user;
  },
  getById: async (db: Knex, id: string) => {
    const user: User = await db("users").where({ id }).first();
    return user;
  },

  createUnverifiedTempUser: async (
    db: Knex,
    email: string,
    password: string
  ): Promise<string> => {
    const hashedPassword = await argon2.hash(password);
    const [userId] = await db("email_verifications")
      .insert({
        email,
        password_hash: hashedPassword,
      })
      .returning("id");

    return userId.id;
  },
  create: async (db: Knex, email: string, hash: string) => {
    const [userId] = await db("users")
      .insert({ email, password_hash: hash, is_verified: false })
      .returning("id");
    return userId.id;
  },

  createWithNullPassword: async (db: Knex, email: string) => {
    const [userId] = await db("users")
      .insert({ email, password_hash: null, is_verified: false })
      .returning("id");
    return userId;
  },

  updatePassword: async (
    db: Knex,
    userId: string,
    hashedPassword: string
  ): Promise<void> => {
    await db("users")
      .where({ id: userId })
      .update({ password_hash: hashedPassword });
  },

  generateVerificationCode: async (
    db: Knex,
    userId: string,
    email: string,
    password: string
  ): Promise<string> => {
    const passwordHash = await argon2.hash(password);
    const code = randomBytes(3).toString("hex").toUpperCase();
    const existingTempUser = await db("email_verifications")
      .where({ id: userId })
      .first();
    if (existingTempUser) {
      await db("email_verifications")
        .where({ id: userId })
        .update({
          verification_code: code,
          expires_at: db.raw("NOW() + INTERVAL '15 minutes'"),
        });
    } else {
      await db("email_verifications").insert({
        id: userId,
        email,
        verification_code: code,
        password_hash: passwordHash,
        expires_at: db.raw("NOW() + INTERVAL '15 minutes'"),
      });
    }

    return code;
  },

  verifyEmail: async (
    db: Knex,
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

    const tempUser = await db("email_verifications")
      .where({ id: userId, verification_code: code })
      .first();

    if (!tempUser) {
      return {
        success: false,
        message: "Verification code expired or invalid",
      };
    }

    if (tempUser.expires_at < new Date()) {
      await db("email_verifications").where({ id: tempUser.id }).del();
      return { success: false, message: "Verification code has expired" };
    }

    const user = await db("users").where({ id: userId }).first();
    let isNewUser;
    if (user) {
      isNewUser = false;
      await db.transaction(async (trx) => {
        await trx("users").where({ id: userId }).update({
          is_verified: true,
          password_hash: tempUser.hashed_password,
        });
      });
    } else {
      isNewUser = true;
      await db("users").insert({
        id: userId,
        email: tempUser.email,
        password_hash: tempUser.password_hash,
        is_verified: true,
      });
    }
    await db("email_verifications").where({ id: tempUser.id }).del();
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

  login: async (db: Knex, loginInput: UserLogin): Promise<User | null> => {
    const { email, password } = loginInput;
    const user: User | undefined = await db<User>("users")
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

  getAdminStatusById: async (db: Knex, id: string): Promise<boolean> => {
    const adminStatus = await db("users").where({ id }).returning("is_admin");
    const isAdmin: boolean = adminStatus[0].is_admin;
    return isAdmin;
  },
};

export default userService;
