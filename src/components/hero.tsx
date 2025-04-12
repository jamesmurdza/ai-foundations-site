import { Zap, LineChart, DollarSign, Sparkle } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export function Hero() {
  return (
    <section className="pb-10">
      <div className="container">
        <div className="flex flex-col items-center gap-6 pt-20 border border-t-0 mx-2 md:mx-10 relative">
          <Badge
            variant="outline"
            className="pl-1 rounded-md text-secondary-foreground bg-card text-card-foreground"
          >
            <span className="mr-2 bg-primary text-primary-foreground rounded-sm py-0.5 px-1.5">
              New
            </span>
            Announcing our seed round →
          </Badge>
          <h1 className="text-center font-heading font-semibold tracking-tight text-balance max-w-3xl md:text-7xl text-5xl sm:text-6xl">
            Learn AI From the Ground Up
          </h1>
          <p className="text-center text-lg text-muted-foreground sm:text-xl max-w-md">
            Providing advanced analytics solutions for businesses to make smarter decisions.
          </p>
          <div className="flex items-center gap-4 mb-16 grid grid-cols-2">
            <Button size="lg" className="gap-2 font-semibold">
              Get started now
            </Button>
            <Button size="lg" variant="outline" className="gap-2 font-semibold">
              Book a free demo
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-12 py-6 border-x mx-2 md:mx-10 relative">
          <div className="flex flex-wrap gap-y-4 justify-center gap-x-16">
            <div className="flex items-center gap-2 justify-center">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <LineChart className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">Scales infinitely</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">Transparent pricing</span>
            </div>
          </div>
          <Sparkle
            size={20}
            className="absolute left-0 -translate-x-1/2 fill-foreground top-0 -translate-y-1/2"
          />
          <Sparkle
            size={20}
            className="absolute fill-foreground right-0 translate-x-1/2 top-0 -translate-y-1/2"
          />
        </div>
        
        <div className="p-10  rounded-2xl">
          <Image alt="Image" src="/images/main-image.avif" width={1300} height={698} />
        </div>
        <div className="flex flex-col items-center gap-6 mb-12 text-center">
          <h2 className="text-xl md:text-2xl font-sans text-[#888888] max-w-2xl mx-auto leading-relaxed font-medium px-4">
            <span className="text-zinc-700 font-semibold">AI Foundations</span> is an online school where you learn to build AI models from first principles alongside professional mentors and new friends
          </h2>
          <div className="flex flex-col sm:flex-row w-full max-w-lg gap-3 px-4">
            <input
              type="email"
              placeholder="name@email.com"
              className="flex-1 px-4 py-3 bg-muted/50 rounded-lg border text-base min-w-0"
            />
            <Button size="lg" className="whitespace-nowrap bg-zinc-800 hover:bg-zinc-700 text-white px-6">
              Get updates!
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 mt-4">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
              <Image
              src="/svgs/youtube-brands.svg"
              alt="YouTube"
              width={30}
              height={30}
              className="text-[#525252]"
              />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
             <Image
              src="/svgs/github-brands.svg"
              alt="GitHub"
              width={30}
              height={30}
              className="text-[#525252]"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
