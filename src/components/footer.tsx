import Link from "next/link";

import { FooterLink } from "@/components/footer-link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="p-10">
      <div className="container flex flex-col gap-6">
        <Separator orientation="horizontal" className="my-4" />
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-heading text-xl font-bold"> AI Foundations</span>
          </Link>
          <div className="flex items-center gap-5">
            <p className="text-balance text-sm text-muted-foreground">
              © AI Foundations. All rights reserved.
            </p>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
