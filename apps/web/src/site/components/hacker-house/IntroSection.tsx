import Image from "next/image";

const STATS = [
  { value: "12", label: "learners" },
  { value: "4", label: "weeks" },
  { value: "6", label: "topics" },
];

export function IntroSection() {
  return (
    <section className="bg-[#faf6ef] py-24 md:py-32">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
            <Image
              src="/images/summer-school/community-workshop.png"
              alt="A room of learners working at laptops around wooden tables, greenery overhead"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </figure>

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#2f5233] mb-4">
              An inclusive living and learning community
            </p>
            <p className="text-xl md:text-2xl text-[#2b2b28] leading-relaxed font-heading tracking-tight">
              AI Foundations invites people of all ages to join an in-person
              community of learners with a focus on software development and AI.
            </p>
            <p className="mt-5 text-lg text-[#6b6b63] leading-relaxed">
              The AI Summer School is our first pop-up school: 12 people will
              live together in Bandung, Indonesia while simultaneously learning
              and teaching. We have been running AI and coding workshops for
              years, and this is our most exciting program so far.
            </p>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="flex items-baseline gap-2">
                    <span className="font-heading text-4xl font-semibold text-[#2f5233]">
                      {s.value}
                    </span>
                    <span className="text-[#6b6b63]">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
