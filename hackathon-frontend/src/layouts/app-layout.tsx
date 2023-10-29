import { useLoginStore } from "@/store/login";
import { Layout } from "./root-layout";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { ResponsiveSidebar, StaticSidebar } from "@/components/sidebar";
import useMounted from "@/hooks/use-mounted";

/**
 * The layout of the app, used for site navigation
 */
const AppLayout: Layout = (props) => {
  const { loginState } = useLoginStore();
  const router = useRouter();
  const mounted = useMounted();

  // if not logged in, redirect to the login page
  useEffect(() => {
    if (!loginState.loggedIn) router.push("/auth");
  });

  // do not render if not mounted
  if (!mounted) return null;

  return (
    <main className="flex h-screen w-screen overflow-clip">
      {/* Static navigation */}
      <div className="hidden lg:block">
        {loginState.loggedIn ? (
          <StaticSidebar username={loginState.account} />
        ) : null}
      </div>

      {/* Responsive navigation */}
      <div className="flex-1 min-h-0 flex flex-col overflow-clip">
        {loginState.loggedIn ? (
          <ResponsiveSidebar username={loginState.account} />
        ) : null}

        {/* Main content */}
        <div className="flex-1 min-h-0 overflow-clip">{props.children}</div>
      </div>
    </main>
  );
};

export default AppLayout;
