import { User, UserSchema } from "../schemas/userSchema";
import userService from "../services/userService";
import { Request, Response } from "express";
import * as argon2 from "argon2";
import z from "zod";

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = UserSchema.parse(req.body);

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
    const userId = await userService.create(email, hashedPw);
    return res.status(201).json({ message: "User successfully created" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input", errors: error.errors });
    } else {
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ message: "Something went wrong, please try again." });
    }
  }
};

export default { createUser };
