import Image from "next/image";

import { Card } from "@site/components/ui/card";
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
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
    </Card>
  );
}
