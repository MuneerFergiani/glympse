import type { AppProps } from "next/app";

import "@/styles/globals.css";
import RootLayout, { LayoutPage } from "@/layouts/root-layout";
import { trpc } from "@/lib/trpc";

type LayoutAppProps = AppProps & {
  Component: LayoutPage;
};

const App = ({ Component, pageProps }: LayoutAppProps) => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  // Render root layout, and any other layouts
  return <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>;
};

export default trpc.withTRPC(App);
