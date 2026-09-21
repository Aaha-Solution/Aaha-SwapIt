import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number().min(1, 'Price must be greater than 0'),
  city: z.string().min(1, 'Please select a city'),
  description: z.string().min(15, 'Description must be at least 15 characters long'),
  condition: z.enum(['Brand New', 'Like New', 'Good', 'Fair']),
  phone: z.string().min(10, 'Contact phone number must be at least 10 digits'),
  imageUrl: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
