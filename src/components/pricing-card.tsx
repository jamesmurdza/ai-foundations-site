import { Sparkle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PricingFeatureItem } from "@/components/pricing-feature-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  isMostPopular: boolean;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  feature5: string;
  className?: string;
}

export function PricingCard({
  name,
  description,
  price,
  isMostPopular,
  feature1,
  feature2,
  feature3,
  feature4,
  feature5,
  className,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative rounded-2xl shadow-none flex flex-col justify-between py-8 px-7 gap-7 border",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-heading text-2xl font-semibold text-foreground">{name}</h4>
          {isMostPopular === true && (
            <span className="rounded-full bg-primary px-3 text-center text-sm font-semibold text-primary-foreground py-1 inline-flex items-center gap-1">
              <Sparkle size={16} className="fill-primary-foreground" />
              Popular
            </span>
          )}
        </div>
        <div>
          <span className="font-heading text-5xl font-semibold">${price}</span>
          <span className="text-muted-foreground font-semibold ml-2 text-xl font-heading">
            Monthly
          </span>
        </div>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex flex-col gap-8">
        <ul className="space-y-2">
          <PricingFeatureItem text={feature1} />
          <PricingFeatureItem text={feature2} />
          <PricingFeatureItem text={feature3} />
          <PricingFeatureItem text={feature4} />
          <PricingFeatureItem text={feature5} />
        </ul>
        <Button size="lg" asChild className="font-semibold">
          <a href="#">Get started</a>
        </Button>
      </div>
    </Card>
  );
}
