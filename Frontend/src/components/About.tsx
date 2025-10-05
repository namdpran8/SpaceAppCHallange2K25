import { Telescope, Cpu, Database, Users } from "lucide-react";

export const About = () => {
  const steps = [
    {
      icon: Database,
      title: "Data Collection",
      description: "Gather astronomical observations from NASA telescopes (Kepler, TESS, K2)",
    },
    {
      icon: Cpu,
      title: "ML Processing",
      description: "Apply machine learning models (XGBoost, CNN) to detect transit signals",
    },
    {
      icon: Telescope,
      title: "Detection",
      description: "Identify and classify potential exoplanets with confidence scores",
    },
    {
      icon: Users,
      title: "Visualization",
      description: "Present results with interactive charts and detailed analysis",
    },
  ];

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            About ExoVission AI
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            An advanced machine learning platform for automated exoplanet detection,
            leveraging NASA's astronomical data and state-of-the-art AI models
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative glass-strong p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all text-center animate-fade-in-up hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
                <step.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* The Science */}
          <div className="glass-strong p-8 rounded-2xl border border-border/50 animate-fade-in-up">
            <h3 className="text-2xl font-bold mb-4">The Science Behind Transit Method</h3>
            <p className="text-muted-foreground mb-4">
              The transit method detects exoplanets by measuring the tiny dip in a star's
              brightness when a planet passes in front of it. Our AI models analyze these
              light curves to identify and characterize potential exoplanets.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <p><strong>Transit Depth:</strong> Indicates planet size relative to the star</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <p><strong>Orbital Period:</strong> Time between successive transits</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                <p><strong>Transit Duration:</strong> Length of time the planet blocks light</p>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="glass-strong p-8 rounded-2xl border border-border/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-2xl font-bold mb-4">NASA Data Sources</h3>
            <div className="space-y-4">
              <div className="glass p-4 rounded-lg border border-border/50">
                <h4 className="font-semibold mb-1">Kepler Space Telescope</h4>
                <p className="text-sm text-muted-foreground">
                  Primary mission: 2009-2013. Discovered 2,662 confirmed exoplanets.
                </p>
              </div>
              <div className="glass p-4 rounded-lg border border-border/50">
                <h4 className="font-semibold mb-1">TESS (Transiting Exoplanet Survey Satellite)</h4>
                <p className="text-sm text-muted-foreground">
                  Launched 2018. Surveying 200,000+ brightest stars near Earth.
                </p>
              </div>
              <div className="glass p-4 rounded-lg border border-border/50">
                <h4 className="font-semibold mb-1">K2 Mission</h4>
                <p className="text-sm text-muted-foreground">
                  Extended Kepler mission: 2014-2018. Added 500+ confirmed exoplanets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mt-16">
          <div className="glass-strong p-8 rounded-2xl border border-border/50 animate-fade-in-up text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">Our Team</h3>
            <p className="text-muted-foreground mb-6">
              This solution is designed by
            </p>
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl font-bold text-white">D</span>
              </div>
              <div className="text-left">
                <h4 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Dark Mode Devs
                </h4>
                <p className="text-sm text-muted-foreground">Elite Development Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
