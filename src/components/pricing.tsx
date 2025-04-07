import { PricingCard } from "@/components/pricing-card";

export function Pricing() {
  return (
    <section className="py-20">
      <div className="flex flex-col items-center gap-6 container">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary text-center">Pricing</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance text-center sm:text-5xl max-w-2xl">
            Convenient pricing for companies at every stage
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-lg text-center sm:text-xl">
          Analyze data instantly, unlock insights with premium. Get started for free. Pay only for
          advanced features.
        </p>
        <div className="mt-7 grid w-full grid-cols-1 lg:grid-cols-3 gap-5">
          <PricingCard
            name="Basic"
            price={19}
            feature1="Unlimited projects"
            feature2="Up to 10k monthly visitors"
            feature3="Basic insights"
            feature4="User surveys"
            feature5="Session tracking"
            description="For personal projects, startups or low-traffic basic websites."
            isMostPopular={false}
          />
          <PricingCard
            name="Pro"
            price={49}
            feature1="Everything in Basic"
            feature2="Priority support"
            feature3="Advanced insights"
            feature4="Custom monthly reports"
            feature5="API Access"
            description="For fast growing startups and modern collaborative product teams."
            isMostPopular
          />
          <PricingCard
            name="Enterprise"
            price={99}
            feature1="Everything in Pro"
            feature2="Single sign-on"
            feature3="Custom SLA"
            feature4="Custom integrations"
            feature5="Custom reporting"
            description="For big companies and enterprises with high traffic and custom needs."
            isMostPopular={false}
          />
        </div>
      </div>
    </section>
  );
}
