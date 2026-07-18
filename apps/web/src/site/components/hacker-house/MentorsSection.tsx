import Image from "next/image";

const MENTORS = [
  {
    name: "James",
    img: "/images/James.jpg",
    url: "https://jamesmurdza.com/",
  },
  {
    name: "Burhan",
    img: "/images/Burhan.jpg",
    url: "https://www.burhankhatri.com/",
  },
  {
    name: "Fleo",
    img: "/images/FleoMae.jpg",
    url: "https://www.linkedin.com/in/fleomae/",
  },
  {
    name: "Taniya",
    img: "/images/taniya-souza.avif",
    url: "https://taniyasouza.vercel.app/",
  },
];

export function MentorsSection() {
  return (
    <section id="community" className="scroll-mt-24">
      <div className="container">
        <div className="border-t mt-12 px-6 md:px-12 pt-12 pb-12 text-center">
          <h2 className="hh-mentor font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-10">
            Community
          </h2>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-8">
            {MENTORS.map((m) => (
              <a
                key={m.name}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${m.name} on LinkedIn`}
                className="hh-mentor flex flex-col items-center gap-3 transition-opacity duration-200 hover:opacity-70"
              >
                <div className="relative w-28 h-28 rounded-full overflow-hidden border">
                  <Image
                    src={m.img}
                    alt={m.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <p className="font-medium">{m.name}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
