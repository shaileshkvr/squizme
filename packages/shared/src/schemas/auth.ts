import { z } from "zod";

export const UsernameSchema = z
  .string()
  .trim()
  .min(4, "Username must be at least 4 characters")
  .max(30, "Username must not exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  );

export const EmailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(255, "Email must not exceed 255 characters")
  .toLowerCase();

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

export const RegisterRequestSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

export const LoginRequestSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username or email is required")
    .max(255),
  password: z.string().min(1, "Password is required"),
});

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
});

export const AuthResponseSchema = z.object({
  user: UserPublicSchema,
  sessionToken: z.string(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
