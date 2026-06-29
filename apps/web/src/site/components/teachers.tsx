import Image from "next/image";

type Social = { youtube?: string; linkedin?: string; twitter?: string };

type Teacher = {
  name: string;
  image: string;
  bio: React.ReactNode;
  social: Social;
};

const TEACHERS: Teacher[] = [
  {
    name: "Naveed Khan",
    image: "/images/Naveed.png",
    bio: (
      <>
        <strong>Naveed Khan</strong> is a machine learning researcher who has
        worked on dozens of machine learning project.
      </>
    ),
    social: {
      linkedin: "https://www.linkedin.com/in/naveed88375/",
      twitter: "https://x.com/veeno47",
    },
  },
  {
    name: "James Murdza",
    image: "/images/James.jpg",
    bio: (
      <>
        <strong>James Murdza </strong>is a software developer and online
        educator who has taught coding to thousands through videos and
        livestreams.
      </>
    ),
    social: {
      youtube: "https://www.youtube.com/@jamesmurdza",
      linkedin: "https://www.linkedin.com/in/jamesmurdza/",
      twitter: "https://x.com/jamesmurdza/",
    },
  },
  {
    name: "Burhan Khatri",
    image: "/images/Burhan.jpg",
    bio: (
      <>
        <strong>Burhan Khatri</strong> is a final year CS student at FAST, an AI
        engineer at Astera, and a Microsoft Learn Student Ambassador.
      </>
    ),
    social: {
      linkedin: "https://www.linkedin.com/in/burhankhatri/",
      twitter: "https://x.com/BurhannKhatri",
    },
  },
];

const SOCIAL_ICONS: { key: keyof Social; src: string; alt: string }[] = [
  { key: "youtube", src: "/svgs/youtube-brands.svg", alt: "YouTube" },
  { key: "linkedin", src: "/svgs/linkedin-brands.svg", alt: "LinkedIn" },
  { key: "twitter", src: "/svgs/twitter-brands.svg", alt: "Twitter" },
];

export function Teachers() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="flex justify-between w-full flex-col lg:flex-row gap-4 lg:items-end mb-16">
          <h2 className="font-heading tracking-tight sm:text-5xl text-3xl text-balance font-semibold text-left flex-1">
            The Teachers
          </h2>
          <p className="text-lg text-muted-foreground flex-1">
            Learn from working engineers and educators who build and teach every day.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {TEACHERS.map((teacher) => (
            <div key={teacher.name} className="flex flex-col items-center">
              <div className="relative w-[200px] h-[200px] mb-8">
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col gap-3 text-center">
                <p className="text-[17px] leading-[1.6] font-normal text-muted-foreground">
                  {teacher.bio}
                </p>
              </div>
              <div className="flex items-center justify-center gap-8 mt-6">
                {SOCIAL_ICONS.map(({ key, src, alt }) => {
                  const href = teacher.social[key];
                  if (!href) return null;
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${teacher.name} on ${alt}`}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Image src={src} alt="" width={20} height={20} />
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
