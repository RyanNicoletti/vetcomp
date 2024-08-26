import { NewUserSchema } from "../schemas/newUserSchema";
import userService from "../services/userService";
import { Request, Response } from "express";
import * as argon2 from "argon2";
import z from "zod";
import emailService from "../services/emailService";
import { loginSchema } from "../schemas/loginSchema";
import { User } from "../schemas/userSchema";
import { hash } from "crypto";

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = NewUserSchema.parse(req.body);
    const existingUser: User | undefined = await userService.findByEmail(email);

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
      userId = await userService.createTemporaryUser(email, password);
      isNewUser = true;
    }

    const verificationCode = await userService.generateVerificationCode(
      userId,
      email
    );
    await emailService.sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      userId,
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
  const { userId, verificationCode } = req.body;
  if (typeof userId !== "string" || typeof verificationCode !== "string") {
    return res.status(400).json({ message: "Invalid input." });
  }

  try {
    const result = await userService.verifyEmailAndActivateUser(userId, verificationCode);

    if (result.success) {
      if (req.session) {
        req.session.userId = userId;
      }
      return res.json({ 
        message: result.message,
        isNewUser: result.isNewUser 
      });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error during email verification:', error);
    return res.status(500).json({ message: "An unexpected error occurred during verification." });
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
    const user: User | null = await userService.login(loginInput);
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
      .json({ message: "Logged in successfully", userId: user.id });
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
