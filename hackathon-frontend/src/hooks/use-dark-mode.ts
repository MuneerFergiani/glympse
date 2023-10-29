import { useTheme } from "next-themes";

/**
 * A hook to use the dark mode
 * @returns an object containing the `dark` boolean and `setDark` function
 */
export default function useDarkMode() {
  const { theme, setTheme } = useTheme();
  return {
    dark: theme !== "light",
    setDark: (value: boolean) => (value ? setTheme("dark") : setTheme("light")),
  };
}
