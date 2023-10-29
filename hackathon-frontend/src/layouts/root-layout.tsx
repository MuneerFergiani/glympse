import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import type { AppProps } from "next/app";
import React, { ReactNode } from "react";
import { env } from "@/env.mjs";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { Toaster } from "@/components/ui/toaster";

/**
 * This type that all layouts must conform to
 */
export type Layout = (props: { children?: ReactNode }) => ReactNode;

/**
 * The type that all pages with layouts must conform to
 */
export type LayoutPage = AppProps["Component"] & {
  getLayout?: (page: ReactNode) => ReactNode;
};

const inter = Inter({ subsets: ["latin"] });

/**
 * The layout that is applied to the entire app, regardless of anything else
 */
const RootLayout: Layout = ({ children }) => {
  return (
    <>
      <MetaMaskProvider
        debug={false}
        sdkOptions={{
          checkInstallationImmediately: false,
          dappMetadata: {
            name: "Glimpse",
            url: env.NEXT_PUBLIC_GLIMPSE_URL,
          },
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <main className={`h-screen w-screen ${inter.className}`}>
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </MetaMaskProvider>
    </>
  );
};

export default RootLayout;
