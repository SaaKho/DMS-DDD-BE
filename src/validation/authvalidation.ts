import { z } from "zod";
import { UserRole } from "../drizzle/schema";

// User Registration Schema
export const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z
    .string()
    .transform((val) => val.toLowerCase()) 
    .refine((val) =>
      Object.values(UserRole)
        .map((role) => role.toLowerCase())
        .includes(val)
    )
    .optional(), // Role is optional
});

// User Login Schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
