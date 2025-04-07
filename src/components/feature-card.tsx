import Image from "next/image";
import { ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  image: string;
  className?: string;
}

export function FeatureCard({ title, image, className }: FeatureCardProps) {
  return (
    <Card className={cn("p-6 rounded-2xl border shadow-none", className)}>
      <div className="mb-6 w-full h-64 relative">
        <Image alt="Purpose-built icon" src={image} fill className="rounded-md object-contain" />
      </div>
      <div className="flex justify-between items-end gap-2">
        <h3 className="font-heading text-xl font-semibold">{title}</h3>
        <Button size="icon" variant="default" className="size-10 shrink-0 rounded-full">
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </Card>
  );
}
