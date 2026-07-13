import Link from "next/link";

import { NavItem } from "@site/components/nav-item";
import { MobileNavbar } from "@site/components/mobile-navbar";
import { MobileNavItem } from "@site/components/mobile-nav-item";

export function Header({ wide = false }: { wide?: boolean }) {
  return (
    <header>
      <div
        className={
          wide ? "mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8" : "container"
        }
      >
        <div className={wide ? "" : "border-x px-6"}>
          <div className="flex justify-between items-center w-full py-4 border-b">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-heading text-xl font-bold">AI Foundations</span>
            </Link>
            <div className="flex items-center gap-4">
              <nav className="hidden items-center gap-8 md:flex">
                {/* <NavItem href="/about" label="About" /> */}
                <NavItem href="/#courses" label="Courses" />
                {/* <NavItem href="/workshops" label="Workshops" /> */}
              </nav>
              <MobileNavbar>
                <nav className="flex flex-col gap-1 border-b bg-background p-4 text-foreground shadow-lg">
                  {/* <MobileNavItem href="/about" label="About" /> */}
                  <MobileNavItem href="/#courses" label="Courses" />
                  {/* <MobileNavItem href="/workshops" label="Workshops" /> */}
                </nav>
              </MobileNavbar>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
