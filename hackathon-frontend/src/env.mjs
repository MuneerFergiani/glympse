import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

function isDomainName(domain) {
  return domain.match(
    /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/,
  );
}

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    STUDY_CONFIRMATION_WINDOW_HOURS: z
      .string()
      .regex(/^[0-9]+?$/, "Please enter a number, not text")
      .transform((arg) => parseFloat(arg))
      .refine((arg) => arg > 0, "Please enter a number more than 0")
      .refine(
        (arg) => arg <= 100_000_000,
        "Please enter a number less than 100,000,000",
      ),
    INTERNAL_HOSTNAME: z.string().url().optional(),
    PORT: z
      .string()
      .regex(/[0-9]{4}/)
      .optional(),
  },

  /*
   * Specify what prefix the client-side variables must have.
   * This is enforced both on type-level and at runtime.
   */
  clientPrefix: "NEXT_PUBLIC_",
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_GLIMPSE_URL: z.string().url(),
  },

  /**
   * Destructure client variables
   */
  runtimeEnv: {
    STUDY_CONFIRMATION_WINDOW_HOURS:
      process.env.STUDY_CONFIRMATION_WINDOW_HOURS,
    INTERNAL_HOSTNAME: process.env.INTERNAL_HOSTNAME,
    PORT: process.env.PORT,
    NEXT_PUBLIC_GLIMPSE_URL: process.env.NEXT_PUBLIC_GLIMPSE_URL,
  },
});
