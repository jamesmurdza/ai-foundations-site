import Link from "next/link";

import { NavItem } from "@/components/nav-item";
import { Button } from "@/components/ui/button";
import { MobileNavbar } from "@/components/mobile-navbar";
import { MobileNavItem } from "@/components/mobile-nav-item";

export function Header() {
  return (
    <header>
      <div className="md:mt-4 container">
        <div className="mx-2 md:mx-10 border-x px-6">
          <div className="flex justify-between items-center w-full py-4 border-b">
            <div className="flex-1">
              <Link href="/" className="flex items-center gap-3">
                <span className="font-heading text-xl font-bold">Statzy</span>
              </Link>
            </div>
            <div className="flex items-center gap-6 flex-1 justify-center">
              <nav className="hidden items-center gap-10 md:flex justify-end">
                <NavItem href="/about" label="About" />
                <NavItem href="/docs" label="Docs" />
                <NavItem href="/blog" label="Blog" />
                <NavItem href="/pricing" label="Pricing" />
              </nav>
            </div>
            <div className="flex items-center gap-10 flex-1 justify-end">
              <div className="hidden items-center gap-2 md:flex">
                <Button asChild variant="ghost" className="font-semibold">
                  <Link href="#" className="cursor-pointer">
                    Log In
                  </Link>
                </Button>
                <Button asChild className="font-semibold">
                  <Link href="#" className="cursor-pointer">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
            <MobileNavbar>
              <div className="rounded-b-lg bg-background py-4 container text-foreground shadow-xl mt-6">
                <nav className="flex flex-col gap-1 pt-2">
                  <MobileNavItem href="/about" label="About" />
                  <MobileNavItem href="/docs" label="Docs" />
                  <MobileNavItem href="/blog" label="Blog" />
                  <MobileNavItem href="/pricing" label="Pricing" />
                  <Button size="lg" asChild className="mt-2 w-full">
                    <Link href="#" className="cursor-pointer">
                      Get Started
                    </Link>
                  </Button>
                </nav>
              </div>
            </MobileNavbar>
          </div>
        </div>
      </div>
    </header>
  );
}
