import { Building2, FileText, Users, Wallet, Truck, HeartPulse } from "lucide-react";

const useCases = [
  {
    icon: FileText,
    title: "Government Procurement",
    description: "Detect bid rigging, inflated pricing, shell companies, and contract manipulation in public tenders.",
    examples: ["Vendor collusion detection", "Price anomaly analysis", "Conflict of interest identification"]
  },
  {
    icon: Wallet,
    title: "Public Spending",
    description: "Monitor budget allocations, expenditures, and fund disbursements for irregularities and misuse.",
    examples: ["Budget deviation alerts", "Duplicate payment detection", "Expense pattern analysis"]
  },
  {
    icon: Users,
    title: "Welfare Programs",
    description: "Verify beneficiary eligibility, detect ghost recipients, and identify duplicate claims.",
    examples: ["Identity verification", "Benefits fraud detection", "Eligibility cross-checking"]
  },
  {
    icon: Building2,
    title: "Contract Management",
    description: "Analyze contract terms, pricing patterns, and vendor relationships for suspicious activities.",
    examples: ["Contract term analysis", "Vendor performance tracking", "Amendment pattern detection"]
  },
  {
    icon: Truck,
    title: "Supply Chain",
    description: "Track government supply chains for counterfeit goods, inflated logistics, and delivery fraud.",
    examples: ["Delivery verification", "Inventory discrepancy alerts", "Supplier fraud detection"]
  },
  {
    icon: HeartPulse,
    title: "Healthcare Programs",
    description: "Detect healthcare fraud in public insurance, billing manipulation, and false claims.",
    examples: ["Billing anomaly detection", "Prescription fraud alerts", "Provider abuse patterns"]
  }
];

const UseCases = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-secondary/20" />
      
      <div className="container px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Applications</span>
          <h2 className="text-3xl md:text-5xl font-bold font-heading mt-4 mb-6">
            Use Cases for{" "}
            <span className="text-gradient">Public Sector</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Tailored solutions for every aspect of government operations and public fund management.
          </p>
        </div>

        {/* Use cases grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.title}
              className="group relative p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 card-shadow hover:elevated-shadow"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <useCase.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold font-heading mb-3 group-hover:text-primary transition-colors">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {useCase.description}
              </p>

              {/* Examples */}
              <ul className="space-y-2">
                {useCase.examples.map((example) => (
                  <li key={example} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{example}</span>
                  </li>
                ))}
              </ul>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
