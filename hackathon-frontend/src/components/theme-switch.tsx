import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import useDarkMode from "@/hooks/use-dark-mode";
import useMounted from "@/hooks/use-mounted";
import { MoonIcon, SunIcon } from "lucide-react";

const ThemeSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    "defaultChecked"
  >
>(({ className, onCheckedChange, ...props }, ref) => {
  const { dark, setDark } = useDarkMode();
  const mounted = useMounted();

  // do not render if not mounted
  if (!mounted) return null;

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-[24px] w-[48px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      onCheckedChange={(checked) => {
        setDark(!dark);
        onCheckedChange ? onCheckedChange(checked) : null;
      }}
      defaultChecked={dark}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "relative pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      >
        <SunIcon
          strokeWidth={2.5}
          size={16}
          className="m-0.5 stroke-foreground/70 rotate-0 scale-100 transition-all ease-out dark:-rotate-90 dark:scale-0"
        />
        <MoonIcon
          strokeWidth={2.5}
          size={16}
          className="absolute top-0 m-0.5 stroke-foreground/90 rotate-90 scale-0 transition-all ease-out dark:rotate-0 dark:scale-100"
        />
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  );
});
ThemeSwitch.displayName = "ThemeSwitch";

export { ThemeSwitch };
