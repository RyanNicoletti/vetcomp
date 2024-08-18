import { User, UserSchema } from "../schemas/userSchema";
import userService from "../services/userService";
import { Request, Response } from "express";
import * as argon2 from "argon2";
import z from "zod";
import emailService from "../services/emailService";

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = UserSchema.parse(req.body);

    const existingUser: User | undefined = await userService.findByEmail(email);
    if (existingUser) {
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
    const hashedPw = await argon2.hash(password);
    const userId: string = await userService.create(email, hashedPw);
    console.log("fuckkkk", userId);
    const verificationToken = await userService.generateVerificationCode(
      userId
    );
    await emailService.sendVerificationEmail(email, verificationToken);
    return res.status(201).json({
      userId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input", errors: error.errors });
    } else {
      res
        .status(500)
        .json({ message: "Something went wrong, please try again." });
    }
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  const { userId, verificationCode } = req.body;

  if (typeof userId !== "string" || typeof verificationCode !== "string") {
    return res.status(400).json({ message: "Invalid input." });
  }

  const verified: boolean = await userService.verifyEmail(
    userId,
    verificationCode
  );

  if (verified) {
    if (req.session) {
      req.session.userId = userId;
    }
    return res.json({ message: "Email verified successfully" });
  } else {
    return res.status(400).json({ message: "Invalid or expired code" });
  }
};

export default { createUser, verifyEmail };
