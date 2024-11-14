import { z } from "zod";

export const documentSchema = z.object({
  fileName: z.string().min(1, { message: "File name is required" }),
  fileExtension: z.string().min(1, { message: "File extension is required" }),
  filePath: z.string().regex(/^uploads\/.*/, {
    message: "File path must be within the 'uploads' directory",
  }),
  userId: z.string().uuid({ message: "Invalid user ID format" }),
  tags: z.array(z.string().min(1, "Tag name cannot be empty")).optional(),
});
