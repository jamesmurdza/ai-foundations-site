import Image from "next/image";
import Link from "next/link";

import { Section } from "@site/components/section";

export function PopupSchools() {
  return (
    <Section
      id="pop-up-schools"
      outerClassName="relative bg-background"
      className="flex flex-col gap-16"
    >
      <div className="flex w-full flex-col lg:flex-row lg:items-end justify-between gap-8">
        <h2 className="font-heading tracking-tight sm:text-4xl text-2xl text-balance font-semibold text-left shrink-0">
          Pop-up schools
        </h2>
        <p className="text-xl text-muted-foreground flex-1 lg:text-right">
          In-person schools where we live and learn together.
        </p>
      </div>
      <Link href="/summer-school" className="group block">
        <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden">
          <Image
            src="/images/summer-school/popup-banner.avif"
            alt="AI Summer School in Bandung, Indonesia"
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
            <h3 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
              AI Summer School
            </h3>
            <p className="mt-2 text-white/90">
              Bandung, Indonesia · 27 July – 21 August 2026
            </p>
          </div>
        </div>
      </Link>
    </Section>
  );
}
