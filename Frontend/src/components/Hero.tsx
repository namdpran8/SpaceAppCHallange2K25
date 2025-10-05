import { Rocket, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export const Hero = () => {
  const scrollToDashboard = () => {
    const element = document.getElementById("dashboard");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-20"
    >
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass rounded-full border border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              NASA Space Apps Challenge 2025
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            ExoVission AI
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automated Exoplanet Detection powered by Machine Learning
          </p>

          <p className="text-base text-muted-foreground/80 mb-12 max-w-xl mx-auto">
            Analyze astronomical datasets, detect exoplanets with AI, and explore the cosmos with cutting-edge visualization tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={scrollToDashboard}
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all hover:scale-105"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Start Detection
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToFeatures}
              className="glass border-border/50 hover:border-primary/50 hover:bg-primary/10"
            >
              Learn More
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Observations", value: "10,000+", icon: "📊" },
              { label: "Confirmed Exoplanets", value: "5,500+", icon: "🪐" },
              { label: "Model Accuracy", value: "98.5%", icon: "🎯" },
              { label: "Hours Saved", value: "50,000+", icon: "⏱️" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-strong p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all animate-fade-in-up hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
