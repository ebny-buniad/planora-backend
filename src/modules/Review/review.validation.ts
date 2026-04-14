import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, "Event id is required"),
    rating: z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "Rating is required"
            : "Rating must be a number",
      })
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Comment is required"
            : "Comment must be a string",
      })
      .min(1, "Comment is required"),
  }),
});

const updateReviewValidationSchema = z.object({
  body: z.object({
    rating: z
      .number({
        error: "Rating must be a number",
      })
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
      .optional(),
    comment: z
      .string({
        error: "Comment must be a string",
      })
      .min(1, "Comment cannot be empty")
      .optional(),
  }),
});

export const ReviewValidations = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};