import { 
  Search, 
  Shield, 
  BarChart3, 
  Bell, 
  Database, 
  Lock,
  Zap,
  Eye
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Anomaly Detection",
    description: "Advanced ML models identify unusual patterns in transactions, contracts, and spending behaviors that deviate from established norms."
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    description: "Proactive detection of fraudulent activities before they impact public funds, reducing financial losses significantly."
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Forecast potential risk areas using historical data patterns, enabling preventive action before fraud occurs."
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Instant notifications when suspicious activities are detected, allowing rapid response and investigation."
  },
  {
    icon: Database,
    title: "Data Integration",
    description: "Seamlessly connect with existing government databases, procurement systems, and financial records."
  },
  {
    icon: Lock,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with full compliance to government data protection and privacy regulations."
  },
  {
    icon: Zap,
    title: "Automated Analysis",
    description: "Process millions of transactions automatically, dramatically reducing manual review time and human error."
  },
  {
    icon: Eye,
    title: "Transparent Reporting",
    description: "Comprehensive audit trails and explainable AI insights for accountability and decision-making."
  }
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      
      <div className="container px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-bold font-heading mt-4 mb-6">
            Comprehensive Fraud Detection{" "}
            <span className="text-gradient">Suite</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete toolkit for detecting, preventing, and analyzing fraud across all government operations.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 card-shadow hover:elevated-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon container */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold font-heading mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-xl bg-primary/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
