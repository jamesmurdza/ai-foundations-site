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
  {
    name: "Victor",
    img: "/images/victor.avif",
    url: "https://www.hamz.at/",
  },
  {
    name: "Madhoolika",
    img: "/images/madhoolika.avif",
    url: "https://www.linkedin.com/in/madhoolika/",
  },
  {
    name: "Abdul",
    img: "/images/abdul.avif",
    url: "https://www.abdulrehmann.com/",
  },
  {
    name: "Harsh",
    img: "/images/harsh.avif",
    url: "https://synacktra.com/",
  },
  {
    name: "Wildan",
    img: "/images/wildan.avif",
    url: "https://wildan-portfolio-six.vercel.app/",
  },
  {
    name: "Momina",
    img: "/images/momina.avif",
    url: "https://www.linkedin.com/in/mominaali/",
  },
  {
    name: "Nurlin",
    img: "/images/nurlin.avif",
    url: "https://www.linkedin.com/in/nurlin-amelia-chelsi-ngadi-7966942b2/",
  },
  {
    name: "Alif",
    img: "/images/alif.avif",
    url: "https://www.linkedin.com/in/alifmslmabdrhmn/",
  },
  {
    name: "Nayla",
    img: "/images/nayla.avif",
    url: "https://www.linkedin.com/in/nayla-aqila-argia-241637322/",
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
