import Link from "next/link";
import { cn } from "@/lib/utils";

interface FooterLinkProps {
  label: string;
  className?: string;
}

export function FooterLink({ label, className }: FooterLinkProps) {
  return (
    <li className={className}>
      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
        {label}
      </Link>
    </li>
  );
}
