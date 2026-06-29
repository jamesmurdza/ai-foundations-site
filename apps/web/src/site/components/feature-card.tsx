import Image from "next/image";
import { ChevronRight } from "lucide-react";

import { Card } from "@site/components/ui/card";
import { Button } from "@site/components/ui/button";
import { cn } from "@site/lib/utils";

interface FeatureCardProps {
  title: string;
  image: string;
  className?: string;
}

export function FeatureCard({ title, image, className }: FeatureCardProps) {
  return (
    <Card className={cn("p-6 rounded-lg border shadow-none h-full flex flex-col", className)}>
      <div className="mb-6 w-full h-64 relative">
        <Image alt="Purpose-built icon" src={image} fill className="rounded-md object-cover" />
      </div>
      <div className="flex justify-between items-end gap-2 mt-auto">
        <h3 className="font-heading text-xl font-semibold">{title}</h3>
        <Button size="icon" variant="default" className="size-10 shrink-0 rounded-md">
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </Card>
  );
}
