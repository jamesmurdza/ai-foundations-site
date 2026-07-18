import Image from "next/image";
import { MapPin, Calendar, Home } from "lucide-react";

const DETAILS = [
  { icon: MapPin, text: "West Java, Indonesia" },
  { icon: Calendar, text: "27th July – 21st August 2026" },
  { icon: Home, text: "Spacious accommodation in a peaceful setting" },
];

export function DetailsSection() {
  return (
    <section className="bg-[#f1e9dc] py-24 md:py-32">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <p className="text-sm uppercase tracking-[0.2em] text-[#2f5233] mb-3">
              When &amp; where
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-[#2b2b28] mb-8">
              A peaceful place to live and build
            </h2>
            <ul className="flex flex-col gap-5">
              {DETAILS.map((d) => (
                <li key={d.text} className="flex items-center gap-4 text-lg text-[#2b2b28]">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2f5233]/10 text-[#2f5233]">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium">{d.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="order-1 md:order-2 relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
            <Image
              src="/images/summer-school/accommodation-balcony.avif"
              alt="A calm wooden balcony with natural-wood tables, potted plants and string lights surrounded by greenery"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
