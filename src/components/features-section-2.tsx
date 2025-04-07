import { Zap, Brain, LayoutDashboard, BarChart } from "lucide-react";
import Image from "next/image";

import { SmallFeatureCard } from "@/components/small-feature-card";

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20">
      <div className="container flex gap-20 flex-col lg:flex-row lg:items-end">
        <div className="flex-1 flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-primary text-left font-heading">Features</span>
            <h1 className="font-heading font-bold sm:text-5xl text-3xl tracking-tight text-balance">
              Turn your data into Actionable Insights&nbsp;
            </h1>
          </div>
          <p className="text-muted-foreground text-lg flex-1">
            Empower your business with real-time analytics, advanced reporting, and intuitive data
            dashboards.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <SmallFeatureCard
              icon={Zap}
              title="Real-Time Tracking"
              description="Monitor key performance indicators across channels."
            />
            <SmallFeatureCard
              icon={Brain}
              title="Predictive Insights"
              description="Leverage AI-powered customer predictions."
            />
            <SmallFeatureCard
              icon={LayoutDashboard}
              title="Custom Dashboards"
              description="Create personalized visualizations that matter."
            />
            <SmallFeatureCard
              icon={BarChart}
              title="Advanced Reports"
              description="Generate detailed reports with just one click."
            />
          </div>
        </div>
        <div className="relative flex-1 bg-primary rounded-2xl p-10">
          <Image alt="Image" src="/images/notifications.png" width={1000} height={698} />
        </div>
      </div>
    </section>
  );
}
