// Public base URL for the Cloudflare R2 "ai-foundations" bucket
// (custom domain connected to the bucket via R2 > Settings > Custom Domains).
const R2_PUBLIC_BASE = "https://mix46.com";
const INTRO_VIDEO_URL = `${R2_PUBLIC_BASE}/${encodeURIComponent(
  "AI Summer School The First Week.mp4",
)}`;

export function IntroSection() {
  return (
    <section id="about" className="scroll-mt-24">
      <div className="container">
        <div className="border-t mt-12 px-6 md:px-12 pt-12 pb-12">
          <div className="hh-intro flex flex-col gap-8 md:gap-12">
            <figure className="relative aspect-video w-full overflow-hidden border">
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
            <div className="flex flex-col justify-center max-w-3xl">
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
