import { Shield, Scan, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      
      {/* Floating elements */}
      <div className="absolute top-20 right-20 animate-float opacity-20">
        <Shield className="w-16 h-16 text-primary" />
      </div>
      <div className="absolute bottom-32 left-16 animate-float opacity-20" style={{ animationDelay: "1s" }}>
        <Scan className="w-12 h-12 text-primary" />
      </div>
      <div className="absolute top-1/3 left-10 animate-float opacity-15" style={{ animationDelay: "2s" }}>
        <AlertTriangle className="w-10 h-10 text-warning" />
      </div>

      <div className="container relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Powered by Advanced ML Algorithms</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            AI-Powered{" "}
            <span className="text-gradient">Fraud Detection</span>{" "}
            for Public Sector
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Protect government spending, procurement, and welfare delivery with machine learning systems that detect anomalies, irregularities, and fraud in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="group px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all duration-300" asChild>
              <a href="/auth">
                Access Dashboard
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-muted-foreground/30 hover:bg-secondary hover:border-primary/50 transition-all duration-300">
              Learn More
            </Button>
          </div>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-heading text-gradient">$2.5B+</div>
              <div className="text-sm text-muted-foreground mt-1">Fraud Detected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-heading text-gradient">99.7%</div>
              <div className="text-sm text-muted-foreground mt-1">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-heading text-gradient">50+</div>
              <div className="text-sm text-muted-foreground mt-1">Government Partners</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
