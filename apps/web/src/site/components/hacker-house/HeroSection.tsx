import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[88vh] w-full overflow-hidden flex items-end">
      {/* Full-bleed forest photo */}
      <Image
        src="/images/summer-school/venue-aerial.png"
        alt="Aerial view of a lush green forested hillside in West Java with a wooden viewing walkway"
        fill
        priority
        sizes="100vw"
        className="object-cover -z-10"
      />
      {/* Warm dark gradient for legibility */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#12210f]/85 via-[#12210f]/35 to-[#12210f]/10" />

      <div className="container pb-16 md:pb-24 pt-40">
        <div className="max-w-3xl text-white">
          <p className="text-sm uppercase tracking-[0.25em] text-[#cfe3b8] mb-5">
            AI Foundations · Summer School
          </p>
          <h1 className="font-heading font-semibold tracking-tight text-balance text-5xl sm:text-6xl md:text-7xl leading-[1.03]">
            AI Summer School
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-2xl leading-relaxed">
            An inclusive living and learning community.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-2 text-sm font-medium ring-1 ring-white/25">
              <MapPin className="h-4 w-4" />
              West Java, Indonesia
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-2 text-sm font-medium ring-1 ring-white/25">
              <Calendar className="h-4 w-4" />
              27th July – 21st August 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
