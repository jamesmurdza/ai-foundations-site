import Link from "@portal/components/Link";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-sea-fog">
      <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-3 meta-light text-[13px]">
        <span>© {new Date().getFullYear()} AI Foundations Summer School</span>
        <nav className="flex items-center gap-4">
          <Link href="/discover" className="hover:text-primary">
            Discover
          </Link>
        </nav>
      </div>
    </footer>
  );
}
