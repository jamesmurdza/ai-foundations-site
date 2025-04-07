import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="flex flex-col items-center bg-card px-10 rounded-2xl py-20 gap-x-6 md:flex-row gap-y-14 border">
          <div className="flex items-start flex-col basis-3/5 gap-6">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl max-w-2xl text-left">
              The smarter way to grow your startup
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg sm:text-xl text-left">
              Analyze with ease. Export to dashboards and custom insights&nbsp; reports. Visualize
              without limits.
            </p>
            <Button
              size="lg"
              asChild={false}
              variant="default"
              className="cursor-pointer gap-2 font-semibold"
            >
              <Link href="#">Get Started</Link>
              <ChevronRight size={16} />
            </Button>
          </div>
          <div className="relative basis-2/5 bg-primary rounded-2xl">
            <Image alt="Image" src="/images/chart.png" width={1000} height={698} />
          </div>
        </div>
      </div>
    </section>
  );
}
