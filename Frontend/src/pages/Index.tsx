import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Dashboard } from "@/components/Dashboard";
import { Statistics } from "@/components/Statistics";
import { About } from "@/components/About";
import { Starfield } from "@/components/Starfield";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <Dashboard />
        <Statistics />
        <About />
        <footer className="py-8 text-center border-t border-border/50 glass-strong">
          <p className="text-sm text-muted-foreground">
            Built for NASA Space Apps Challenge 2025 • Hunting Exoplanets with AI
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
