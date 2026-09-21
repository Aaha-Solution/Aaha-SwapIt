import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  city: z.string().min(1, 'Please select your city'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service',
  }),
});

export type SignupFormData = z.infer<typeof signupSchema>;
