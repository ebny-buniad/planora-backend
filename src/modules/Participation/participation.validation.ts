import { z } from "zod";

const joinEventValidationSchema = z.object({
  body: z.object({}).optional(),
});

const updateParticipationStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "BANNED"]),
  }),
});

export const ParticipationValidations = {
  joinEventValidationSchema,
  updateParticipationStatusValidationSchema,
};