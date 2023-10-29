import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "../server/routers/_app";
import { env } from "@/env.mjs";

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";
  if (env.NEXT_PUBLIC_GLIMPSE_URL)
    // reference for vercel.com
    return `https://${env.NEXT_PUBLIC_GLIMPSE_URL}`;
  if (env.INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${env.INTERNAL_HOSTNAME}:${env.PORT ?? 8080}`;
  // assume localhost
  return `http://localhost:${env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            return {
              // authorization: getAuthCookie(),
            };
          },
        }),
      ],
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: false,
});
