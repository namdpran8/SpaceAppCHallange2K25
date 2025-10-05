import { Rocket, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export const Navbar = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Rocket className="h-8 w-8 text-primary group-hover:animate-float transition-transform" />
            <div className="absolute inset-0 blur-lg bg-primary/30 group-hover:bg-primary/50 transition-all" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ExoVission AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("home")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("dashboard")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => scrollToSection("statistics")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Statistics
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="glass border-border/50 hover:border-primary/50 hover:bg-primary/10"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
};
