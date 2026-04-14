import { z } from 'zod';

export const createEventValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    date: z.string().datetime({ message: 'Date must be a valid ISO datetime string' }),
    venue: z.string().min(1, 'Venue is required'),
    eventType: z.enum(['PUBLIC', 'PRIVATE']),
    feeType: z.enum(['FREE', 'PAID']),
    fee: z.number().optional(),
  }),
});

export const updateEventValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    date: z.string().datetime().optional(),
    venue: z.string().min(1).optional(),
    eventType: z.enum(['PUBLIC', 'PRIVATE']).optional(),
    feeType: z.enum(['FREE', 'PAID']).optional(),
    fee: z.number().optional(),
  }),
});

export const EventValidations = {
  createEventValidationSchema,
  updateEventValidationSchema,
};