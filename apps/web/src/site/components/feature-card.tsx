import Image from "next/image";
import { ChevronRight } from "lucide-react";

import { Card } from "@site/components/ui/card";
import { buttonVariants } from "@site/components/ui/button";
import { cn } from "@site/lib/utils";

interface FeatureCardProps {
  title: string;
  image: string;
  className?: string;
}

export function FeatureCard({ title, image, className }: FeatureCardProps) {
  return (
    <Card className={cn("p-6 rounded-lg border-0 bg-transparent shadow-none h-full flex flex-col", className)}>
      <div
        className="mb-6 w-full h-64 relative rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage:
            "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
        }}
      >
        <Image alt={`${title} course`} src={image} fill className="object-contain" />
      </div>
      <div className="flex justify-between items-end gap-2 mt-auto">
        <h3 className="font-heading text-xl font-semibold">{title}</h3>
        <span
          aria-hidden="true"
          className={cn(buttonVariants({ size: "icon", variant: "default" }), "size-10 shrink-0 rounded-md")}
        >
          <ChevronRight className="size-5" />
        </span>
      </div>
    </Card>
  );
}
