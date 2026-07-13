import Link from "next/link";
import { cn } from "@site/lib/utils";

interface MobileNavItemProps {
  label: string;
  href: string;
  className?: string;
}

export function MobileNavItem({ label, href, className }: MobileNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full cursor-pointer items-center rounded-md px-4 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {label}
    </Link>
  );
}
