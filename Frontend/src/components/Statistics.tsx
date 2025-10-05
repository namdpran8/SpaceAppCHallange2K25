import { BarChart3, Target, Cpu, Clock } from "lucide-react";
import { Progress } from "./ui/progress";

export const Statistics = () => {
  const stats = [
    { label: "Overall Accuracy", value: 98.5, icon: Target, color: "text-success" },
    { label: "Total Predictions", value: 10000, icon: BarChart3, color: "text-primary" },
    { label: "Models Used", value: 3, icon: Cpu, color: "text-accent" },
    { label: "Avg Processing Time", value: 0.3, suffix: "s", icon: Clock, color: "text-secondary" },
  ];

  const modelComparison = [
    { name: "Random Forest", accuracy: 95.2, precision: 94.8, recall: 95.6 },
    { name: "XGBoost", accuracy: 98.5, precision: 98.2, recall: 98.8 },
    { name: "CNN (Deep Learning)", accuracy: 97.8, precision: 97.5, recall: 98.1 },
  ];

  const featureImportance = [
    { name: "Transit Depth", importance: 95 },
    { name: "Orbital Period", importance: 82 },
    { name: "Planet Radius", importance: 76 },
    { name: "Transit Duration", importance: 68 },
    { name: "Stellar Temperature", importance: 54 },
  ];

  return (
    <section id="statistics" className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Model Statistics
          </h2>
          <p className="text-muted-foreground text-lg">
            Performance metrics and analysis insights
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass-strong p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all animate-fade-in-up hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold">
                {stat.value < 100 ? stat.value.toFixed(1) : stat.value.toLocaleString()}
                {stat.suffix || (stat.value < 100 ? "%" : "")}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Model Comparison */}
          <div className="glass-strong p-8 rounded-2xl border border-border/50 animate-fade-in-up">
            <h3 className="text-2xl font-bold mb-6">Model Comparison</h3>
            <div className="space-y-6">
              {modelComparison.map((model, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-semibold text-lg">{model.name}</h4>
                  <div className="space-y-2">
                    {Object.entries(model)
                      .filter(([key]) => key !== "name")
                      .map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize text-muted-foreground">{key}</span>
                            <span className="font-medium">{value}%</span>
                          </div>
                          <Progress value={Number(value)} />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Importance */}
          <div className="glass-strong p-8 rounded-2xl border border-border/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-2xl font-bold mb-6">Feature Importance</h3>
            <div className="space-y-4">
              {featureImportance.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{feature.name}</span>
                    <span className="font-medium text-primary">{feature.importance}%</span>
                  </div>
                  <Progress value={feature.importance} />
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 glass rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2">Dataset Info</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Training samples: 8,000</p>
                <p>Testing samples: 2,000</p>
                <p>Class balance: 60% confirmed, 30% candidate, 10% false positive</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
