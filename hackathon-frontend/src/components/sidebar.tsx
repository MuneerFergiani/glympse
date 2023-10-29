import {
  MegaphoneIcon,
  UsersIcon,
  LucideIcon,
  MenuIcon,
  MoonIcon,
  KeyRoundIcon,
  SunIcon,
  EyeIcon,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import useDarkMode from "@/hooks/use-dark-mode";
import useMounted from "@/hooks/use-mounted";
import useWindowSize from "@/hooks/use-window-size";
import { ThemeSwitch } from "./theme-switch";

/**
 * A button component for the static sidebar
 */
function StaticSidebarButton(props: {
  /** The name for the button */
  name: string;
  /** The icon for this button */
  icon: LucideIcon;
  /** The path this button points towards */
  href: string;
  /** The number of notications */
  count?: number;
}) {
  const badge = (() => {
    if (!props.count || props.count < 1) return;
    if (props.count > 9) return "9+";
    return props.count.toString();
  })();

  const pathname = usePathname();
  const current = props.href === pathname;

  return (
    <Link
      key={props.name}
      href={props.href}
      className={cn(
        "group relative flex items-center p-2 text-sm font-medium transition-all ease-out",
      )}
    >
      <span
        className={cn(
          "h-5 rounded-full relative -left-0.5 transition-all ease-out bg-foreground/90",
          {
            "w-1 h-5 mr-1.5": current,
            "w-0 h-2 mr-0": !current,
          },
        )}
      />
      <props.icon
        className={cn("mr-3 h-6 w-6 flex-shrink-0 transition-all ease-out", {
          "stroke-accent-foreground": current,
          "stroke-muted-foreground": !current,
        })}
        aria-hidden="true"
      />
      <span
        className={cn("select-none flex-1 transition-all ease-out", {
          "text-accent-foreground": current,
          "text-muted-foreground": !current,
        })}
      >
        {props.name}
      </span>
      {badge ? (
        <Badge
          variant="secondary"
          className="select-none bg-primary text-primary-foreground hover:bg-primary"
        >
          {badge}
        </Badge>
      ) : null}
    </Link>
  );
}

function StaticDarkModeButton() {
  const { dark, setDark } = useDarkMode();
  const mounted = useMounted();

  // do not render if not mounted
  if (!mounted) return null;

  return (
    <span
      onClick={() => setDark(!dark)}
      className="group cursor-pointer relative flex items-center p-2 text-sm font-medium transition-all ease-out"
    >
      <SunIcon
        aria-hidden="true"
        className="mr-3 h-6 w-6 flex-shrink-0 transition-all ease-out rotate-0 scale-100 stroke-muted-foreground dark:-rotate-90 dark:scale-0 group-hover:stroke-foreground"
      />
      <MoonIcon
        aria-hidden="true"
        className="absolute top-2 left-2 transition-all ease-out rotate-90 scale-0 stroke-muted-foreground dark:rotate-0 dark:scale-100 group-hover:stroke-foreground"
      />
      <span className="select-none flex-1 transition-all ease-out text-muted-foreground group-hover:text-foreground">
        Change Theme
      </span>
    </span>
  );
}

/**
 * A static sidebar component that allows for nagivation
 */
export function StaticSidebar(props: { username: string }) {
  return (
    <div className="flex flex-col w-72 min-w-fit h-full min-h-fit overflow-auto scrollbar-none shadow-sm border-r pb-4">
      {/* Brand */}
      <div className="my-5 flex flex-shrink-0 items-center gap-4 px-4">
        <h1 className="select-none text-3xl font-bold">Glimpse</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Sidebar">
        {/* Primary navigation */}
        <StaticSidebarButton name="Participate" icon={UsersIcon} href="/" />
        <StaticSidebarButton
          name="Propose"
          icon={MegaphoneIcon}
          href="/propose"
        />
        <StaticSidebarButton name="View" icon={EyeIcon} href="/view" />

        {/* Separator */}
        <span className="flex-1" />

        {/* Dark mode */}
        <StaticDarkModeButton />

        {/* Account info */}
        <span className="cursor-pointer relative flex items-center p-2 text-sm font-medium transition-all ease-out rounded-lg">
          <KeyRoundIcon
            aria-hidden="true"
            className="mr-3 h-6 w-6 flex-shrink-0 transition-all ease-out stroke-foreground"
          />
          <span className="w-52">
            <span className="select-none flex-1 transition-all ease-out text-base text-foreground">
              My Account
            </span>
            <div className="truncate w-full select-none flex-1 transition-all ease-out text-xs text-foreground/70">
              {props.username}
            </div>
          </span>
        </span>
      </nav>
    </div>
  );
}

/**
 * A button component for the responsive sidebar
 */
function ResponsiveSidebarButton(props: {
  /** The name for the button */
  name: string;
  /** The path this button points towards */
  href: string;
}) {
  const pathname = usePathname();
  const current = props.href === pathname;

  return (
    <Link key="name" href={props.href}>
      <SheetTrigger asChild>
        <Button
          variant="link"
          className={cn("p-0 h-8", {
            "text-foreground": current,
            "text-muted-foreground": !current,
          })}
        >
          {props.name}
        </Button>
      </SheetTrigger>
    </Link>
  );
}

/**
 * A dynamic sidebar component that allows for nagivation
 */
export function ResponsiveSidebar(props: { username: string }) {
  const { width } = useWindowSize();
  const mounted = useMounted();

  // Prevent flickering by not
  // rendering until mounted
  if (!mounted) return null;

  return width >= 1024 ? null : (
    <Sheet>
      <div className="w-full min-h-fit h-fit max-h-fit flex items-center shadow-sm border-b">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="m-1">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <span className="flex-1 flex items-center justify-center gap-2">
          <h1 className="select-none text-3xl font-bold">Glimpse</h1>
        </span>
        <ThemeSwitch className="m-2" />
      </div>

      <SheetContent className="flex flex-col sm:w-80" side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-start overflow-auto scrollbar-none">
          <ResponsiveSidebarButton name="Participate" href="/" />
          <ResponsiveSidebarButton name="Propose" href="/propose" />
          <ResponsiveSidebarButton name="View" href="/view" />
          <span className="flex-1" />
          <div className="flex gap-3">
            <KeyRoundIcon className="w-4 h-4 flex-shrink-0" />
            <span className="w-64 truncate text-sm">{props.username}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
