import { Database, Cpu, AlertCircle, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Database,
    step: "01",
    title: "Data Integration",
    description: "Connect your government databases, procurement systems, contracts, and financial records to our secure platform."
  },
  {
    icon: Cpu,
    step: "02",
    title: "ML Analysis",
    description: "Our AI models analyze patterns across millions of transactions, learning normal behavior and identifying deviations."
  },
  {
    icon: AlertCircle,
    step: "03",
    title: "Anomaly Detection",
    description: "Suspicious activities, irregularities, and potential fraud are flagged with confidence scores and risk assessments."
  },
  {
    icon: FileCheck,
    step: "04",
    title: "Action & Reporting",
    description: "Receive detailed reports, initiate investigations, and track outcomes with full audit trail capabilities."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative bg-secondary/30">
      <div className="container px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Process</span>
          <h2 className="text-3xl md:text-5xl font-bold font-heading mt-4 mb-6">
            How It{" "}
            <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From data ingestion to actionable insights in four streamlined steps.
          </p>
        </div>

        {/* Process steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[calc(100%-200px)] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent hidden lg:block" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.title} className="relative text-center group">
                {/* Step number badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-primary bg-background px-3 py-1 rounded-full border border-primary/30 z-10">
                  Step {item.step}
                </div>

                {/* Icon circle */}
                <div className="relative w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-card border-2 border-border group-hover:border-primary/50 flex items-center justify-center transition-all duration-300">
                  <item.icon className="w-8 h-8 text-primary" />
                  
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-0 group-hover:opacity-100" />
                </div>

                <h3 className="text-xl font-semibold font-heading mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 -right-4 text-primary/30">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
