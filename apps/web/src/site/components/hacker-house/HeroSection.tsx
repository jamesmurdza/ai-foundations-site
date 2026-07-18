import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-10 overflow-hidden">
      <div className="container">
        <figure className="relative overflow-hidden min-h-[560px] md:min-h-[640px] flex items-center justify-center">
            <Image
              src="/images/summer-school/hero-path.avif"
              alt="Aerial view of a wooden walkway and stairs winding through a lush green forested hillside"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-black/25" />
            <figcaption className="absolute inset-0 z-10 flex flex-col px-6 py-10 text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="hh-tagline font-heading font-semibold tracking-tight text-xl md:text-2xl text-white/90 mb-4">
                  An inclusive living and learning community
                </p>
                <h1 className="hh-headline font-heading font-semibold tracking-tight text-balance max-w-4xl text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
                  AI Summer School
                </h1>
                <p className="hh-sub mt-6 text-lg md:text-xl text-white max-w-2xl leading-relaxed">
                  AI Foundations invites learners of all ages to join an in-person
                  community focused on personal growth and lifelong learning.
                </p>
              </div>
              <div className="hh-meta flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
                <span className="flex items-center gap-2 text-white">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Bandung, Indonesia</span>
                </span>
                <span className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">27th July – 21st August 2026</span>
                </span>
              </div>
            </figcaption>
        </figure>
      </div>
    </section>
  );
}
