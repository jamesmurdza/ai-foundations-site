import Image from "next/image";

export function IntroSection() {
  return (
    <section id="about" className="scroll-mt-24">
      <div className="container">
        <div className="border-t mt-12 px-6 md:px-12 pt-12 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <figure className="hh-intro relative aspect-[4/3] overflow-hidden border order-1 md:order-2">
              <Image
                src="/images/summer-school/accommodation-balcony.avif"
                alt="A calm wooden balcony with natural-wood tables, potted plants and string lights surrounded by greenery"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </figure>
            <div className="hh-intro flex flex-col justify-center order-2 md:order-1">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-5">
                Learn and teach for four weeks in West Java, Indonesia
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The AI Summer School is our first pop-up school: 12 people will
                live together in Bandung, Indonesia while simultaneously learning
                and teaching. We have been running AI and coding workshops for
                years, and this is our most exciting program so far.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
