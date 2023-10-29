import { isServerSide } from "@/lib/utils";
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = isServerSide() ? useEffect : useLayoutEffect;

export default useIsomorphicLayoutEffect;
