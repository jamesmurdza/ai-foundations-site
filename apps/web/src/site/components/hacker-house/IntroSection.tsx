// Public base URL for the Cloudflare R2 "ai-foundations" bucket.
// TODO: switch to the mix46.com custom domain once it's connected to the
// bucket via R2 > Settings > Custom Domains (currently returns CF error 1014).
const R2_PUBLIC_BASE = "https://pub-e770d246579e447597c97d09a9904a9c.r2.dev";
const INTRO_VIDEO_URL = `${R2_PUBLIC_BASE}/${encodeURIComponent(
  "AI Summer School The First Week.mp4",
)}`;

export function IntroSection() {
  return (
    <section id="about" className="scroll-mt-24">
      <div className="container">
        <div className="border-t mt-12 px-6 md:px-12 pt-12 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <figure className="hh-intro relative aspect-[4/3] overflow-hidden border order-1 md:order-2">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={INTRO_VIDEO_URL}
                poster="/images/summer-school/accommodation-balcony.avif"
                controls
                playsInline
                preload="metadata"
                aria-label="Learn and teach for four weeks in West Java, Indonesia"
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
