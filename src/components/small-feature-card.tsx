import { LucideProps } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SmallFeatureCardProps {
  title: string;
  description: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  className?: string;
}

export function SmallFeatureCard({
  title,
  description,
  icon: Icon,
  className,
}: SmallFeatureCardProps) {
  return (
    <Card className={cn("rounded-2xl p-6 flex flex-col gap-2 border shadow-none", className)}>
      <div className="items-center gap-2 flex">
        <Icon className="h-5 w-5" />
        <h3 className="font-heading font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </Card>
  );
}
