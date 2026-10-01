import { z } from 'zod';

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .refine((val) => /[a-zA-Z]/.test(val), {
    message: 'Password must contain at least one letter'
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must contain at least one number'
  })
  .refine((val) => /[^a-zA-Z0-9]/.test(val), {
    message: 'Password must contain at least one special character'
  });

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
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
  newPassword: PasswordSchema
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

