import { Brain, Zap, BarChart3 } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "XGBoost Model",
      description: "Fast, accurate tabular data prediction with feature importance analysis",
      color: "text-primary",
      glow: "glow-primary",
    },
    {
      icon: Zap,
      title: "CNN Model",
      description: "Deep learning time-series analysis for light curve classification",
      color: "text-secondary",
      glow: "glow-primary",
    },
    {
      icon: BarChart3,
      title: "Interactive Interface",
      description: "Batch upload, real-time results, and beautiful visualizations",
      color: "text-accent",
      glow: "glow-accent",
    },
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            State-of-the-art machine learning models combined with intuitive design
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`glass-strong p-8 rounded-2xl border border-border/50 hover:border-primary/50 transition-all group hover:scale-105 animate-fade-in-up ${feature.glow}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative mb-6">
                <feature.icon className={`h-12 w-12 ${feature.color} group-hover:animate-float`} />
                <div className={`absolute inset-0 blur-xl ${feature.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
