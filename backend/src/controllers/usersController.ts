import { Request, Response } from "express";
import { NewUserSchema } from "../schemas/newUserSchema";
import userService from "../services/userService";
import emailService from "../services/emailService";
import { loginSchema } from "../schemas/loginSchema";
import { randomBytes } from "node:crypto";
import { redisClient } from "../../config/redisConfig";
import { db } from "../db/connection";
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from "../errors/httpErrors";
import { asyncHandler } from "../middleware/asyncHandler";

const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = NewUserSchema.parse(req.body);
  const existingUser = await userService.findByEmail(db, email);

  let userId: string;
  let isNewUser: boolean = false;

  if (existingUser) {
    if (existingUser.is_verified) {
      throw new BadRequestError("That email is not available");
    }
    userId = existingUser.id;
  } else {
    userId = await userService.createUnverifiedTempUser(db, email, password);
    isNewUser = true;
  }

  const verificationCode = await userService.generateVerificationCode(
    db,
    userId,
    email,
    password
  );
  await emailService.sendVerificationEmail(email, verificationCode);

  const token = randomBytes(16).toString("hex");
  await redisClient.set(`verify_token:${token}`, userId, { EX: 15 * 60 }); // 15 minutes expiry

  res.status(201).json({
    token,
    message: "Verification email sent",
    isNewUser,
  });
});

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token, verificationCode } = req.body;
  if (typeof token !== "string" || typeof verificationCode !== "string") {
    throw new BadRequestError("Invalid input.");
  }

  const result = await userService.verifyEmail(db, token, verificationCode);
  const user = await userService.getById(db, result.userId!);

  if (result.success) {
    if (req.session && result.userId) {
      req.session.userId = result.userId;
    }
    res.status(200).json({
      message: result.message,
      isNewUser: result.isNewUser,
      isAuthenticated: true,
      isAdmin: user.is_admin,
    });
  } else {
    throw new BadRequestError(result.message);
  }
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err: any) => {
      if (err) {
        throw new InternalServerError(
          "Unexpected error when logging out, please try again"
        );
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully." });
    });
  } else {
    res.end();
  }
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const loginInput = loginSchema.parse(req.body);
  const user = await userService.login(db, loginInput);

  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }

  if (!user.is_verified) {
    throw new BadRequestError("Please verify your email before logging in");
  }

  if (req.session) {
    req.session.userId = user.id;
  }

  res.status(200).json({
    message: "Logged in successfully",
    userId: user.id,
    isAuthenticated: true,
    isAdmin: user.is_admin,
  });
});

const forgotPwVerifyEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await userService.findByEmail(db, email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const resetToken = randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    await userService.saveResetToken(db, user.id, resetToken, resetTokenExpiry);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(email, resetLink);

    res.json({ message: "Password reset email sent" });
  }
);

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const user = await userService.findByResetToken(db, token);

  if (
    !user ||
    (user.reset_token_expiry !== null &&
      user.reset_token_expiry.getTime() < Date.now())
  ) {
    throw new BadRequestError("Invalid or expired reset token");
  }

  await userService.updatePassword(db, user.id, password);
  await userService.clearResetToken(db, user.id);

  res.json({ message: "Password reset successful" });
});

export default {
  createUser,
  verifyEmail,
  logout,
  login,
  forgotPwVerifyEmail,
  resetPassword,
};
