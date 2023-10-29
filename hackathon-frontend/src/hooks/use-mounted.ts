import { useState } from "react";

import useIsomorphicLayoutEffect from "@/hooks/use-isomorphic-layout-effect";

/**
 * A hook for conditionally rendering a component until it is mounted on the client
 * @returns a stateful boolean value indicating whether the component is mounted
 */
export default function useMounted() {
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted;
}
