import { NewUserSchema } from "../schemas/newUserSchema";
import userService from "../services/userService";
import { Request, Response } from "express";
import z from "zod";
import emailService from "../services/emailService";
import { loginSchema } from "../schemas/loginSchema";
import { User } from "../schemas/userSchema";
import { randomBytes } from "node:crypto";
import { redisClient } from "../../config/redisConfig";
import { db } from "../db/connection";

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = NewUserSchema.parse(req.body);
    const existingUser: User | undefined = await userService.findByEmail(
      db,
      email
    );

    let userId: string;
    let isNewUser: boolean = false;

    if (existingUser) {
      if (existingUser.is_verified) {
        return res.status(400).json({
          message: "Email already exists",
          errors: [
            {
              field: "email",
              message: "That email is not available",
            },
          ],
        });
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

    return res.status(201).json({
      token,
      message: "Verification email sent",
      isNewUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors: formattedErrors });
    } else {
      res.status(500).json({
        message: "An unexpected error occurred, please try again later.",
      });
    }
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  const { token, verificationCode } = req.body;
  if (typeof token !== "string" || typeof verificationCode !== "string") {
    return res.status(400).json({ message: "Invalid input." });
  }

  try {
    const result = await userService.verifyEmail(db, token, verificationCode);
    const user = await userService.getById(db, result.userId!); // needs err handling

    if (result.success) {
      if (req.session && result.userId) {
        req.session.userId = result.userId;
      }
      return res.status(200).json({
        message: result.message,
        isNewUser: result.isNewUser,
        isAuthenticated: true,
        isAdmin: user.is_admin,
      });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error during email verification:", error);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during verification." });
  }
};

const logout = async (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          message: "Unexpected error when logging out, please try again",
        });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully." });
    });
  } else {
    res.end();
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const loginInput = loginSchema.parse(req.body);
    const user: User | null = await userService.login(db, loginInput);
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        errors: [
          {
            field: "password",
            message: "Invalid email or password",
          },
        ],
      });
    }
    if (!user.is_verified) {
      return res.status(400).json({
        message: "Please verify your email before logging in",
        errors: [
          {
            field: "email",
            message: "Please verify your email before logging in",
          },
        ],
      });
    }
    if (req.session) {
      req.session.userId = user.id;
    }
    return res
      .status(200)
      .json({
        message: "Logged in successfully",
        userId: user.id,
        isAuthenticated: true,
        isAdmin: user.is_admin,
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({ errors: formattedErrors });
    } else {
      return res
        .status(500)
        .json({ message: "Unable to login, please try again later." });
    }
  }
};

export default { createUser, verifyEmail, logout, login };
