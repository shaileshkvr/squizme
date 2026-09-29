import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100)
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const UpdateApiKeySchema = z.object({
  apiKey: z.string().min(10)
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100)
});

export const UserSchema = RegisterRequestSchema;
export const LoginSchema = LoginRequestSchema;

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type UpdateApiKey = z.infer<typeof UpdateApiKeySchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type User = z.infer<typeof UserSchema>;

