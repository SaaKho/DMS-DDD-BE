import { z } from "zod";

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tag name is required" })
    .max(50, { message: "Tag name cannot exceed 50 characters" }),
});
