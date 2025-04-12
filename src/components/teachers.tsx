import Image from "next/image";

export function Teachers() {
  return (
    <section className="py-24">
      <div className="container">
        <h2 className="text-[40px] font-heading font-bold text-center mb-20">
          The Teachers
        </h2>
        <div className="grid md:grid-cols-2 gap-20 max-w-4xl mx-auto">
          {/* Naveed Card */}
          <div className="flex flex-col items-center">
            <div className="relative w-[260px] h-[260px] mb-8">
              <Image
                src="/images/Naveed.avif"
                alt="Naveed Kahn"
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col gap-3 text-center max-w-[300px]">
              <p className="text-[17px] leading-[1.6] font-normal text-[#525252]">
                <strong>Naveed Khan</strong> is a machine learning researcher who has worked on dozens of machine learning project.
              </p>
            </div>
            <div className="flex items-center justify-center gap-8 mt-6">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <Image
                  src="/svgs/youtube-brands.svg"
                  alt="YouTube"
                  width={20}
                  height={20}
                  className="text-[#525252]"
                />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <Image
                  src="/svgs/linkedin-brands.svg"
                  alt="LinkedIn"
                  width={20}
                  height={20}
                  className="text-[#525252]"
                />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <Image
                  src="/svgs/twitter-brands.svg"
                  alt="Twitter"
                  width={20}
                  height={20}
                  className="text-[#525252]"
                />
              </a>
            </div>
          </div>

          {/* James Card */}
          <div className="flex flex-col items-center">
            <div className="relative w-[260px] h-[260px] mb-8">
              <Image
                src="/images/James.avif"
                alt="James Murdza"
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col gap-3 text-center max-w-[300px]">
              <p className="text-[17px] leading-[1.6] font-normal text-[#525252]">
                <strong>James Murdza </strong>is a software developer and online educator who has taught coding to thousands through videos and livestreams.
              </p>
            </div>
            <div className="flex items-center justify-center gap-8 mt-6">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <Image
                  src="/svgs/youtube-brands.svg"
                  alt="YouTube"
                  width={20}
                  height={20}
                  className="text-[#525252]"
                />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <Image
                  src="/svgs/linkedin-brands.svg"
                  alt="LinkedIn"
                  width={20}
                  height={20}
                  className="text-[#525252]"
                />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <Image
                  src="/svgs/twitter-brands.svg"
                  alt="Twitter"
                  width={20}
                  height={20}
                  className="text-[#525252]"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 