import { TrendingUp, Users, Clock, DollarSign } from "lucide-react";

const stats = [
  {
    icon: DollarSign,
    value: "$2.5B+",
    label: "Fraud Prevented",
    description: "Total value of fraudulent transactions detected and prevented"
  },
  {
    icon: TrendingUp,
    value: "99.7%",
    label: "Detection Accuracy",
    description: "Industry-leading precision with minimal false positives"
  },
  {
    icon: Clock,
    value: "<5min",
    label: "Response Time",
    description: "Average time from detection to alert notification"
  },
  {
    icon: Users,
    value: "50M+",
    label: "Transactions Analyzed",
    description: "Monthly transaction volume processed by our systems"
  }
];

const Stats = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      
      <div className="container px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative p-8 rounded-2xl bg-gradient-card border border-border/50 text-center group hover:border-primary/30 transition-all duration-300 card-shadow"
            >
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              
              {/* Value */}
              <div className="text-4xl md:text-5xl font-bold font-heading text-gradient mb-2">
                {stat.value}
              </div>
              
              {/* Label */}
              <div className="text-lg font-semibold mb-2">
                {stat.label}
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
