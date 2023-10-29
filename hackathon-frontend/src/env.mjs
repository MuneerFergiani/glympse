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
    INTERNAL_HOSTNAME: process.env.INTERNAL_HOSTNAME,
    PORT: process.env.PORT,
    NEXT_PUBLIC_GLIMPSE_URL: process.env.NEXT_PUBLIC_GLIMPSE_URL,
  },
});
