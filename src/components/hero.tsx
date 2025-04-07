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
        <div className="p-10 bg-primary rounded-2xl">
          <Image alt="Image" src="/images/hero.png" width={1300} height={698} />
        </div>
      </div>
    </section>
  );
}
