import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItemProps {
  label: string;
  href: string;
  className?: string;
}

export function NavItem({ label, href, className }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn("flex cursor-pointer items-center text-sm font-semibold", className)}
    >
      {label}
    </Link>
  );
}
