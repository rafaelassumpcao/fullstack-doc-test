import { z } from "zod";

export const compareReportsParamsSchema = z.object({
  params: z.object({
    cik: z
      .string()
      .min(1, { message: "CIK parameter is required." })
      .regex(/^\d+$/, { message: "CIK parameter must be numeric." })
      .max(10, { message: "CIK parameter cannot exceed 10 digits." }),
  }),
});

export type CompareReportsParams = z.infer<typeof compareReportsParamsSchema>;
