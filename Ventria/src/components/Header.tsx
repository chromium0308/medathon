import { Link } from "react-router-dom";
import { Heart, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = ({ variant = "landing" }: { variant?: "landing" | "patient" | "clinician" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent transition-transform group-hover:scale-110">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground tracking-tight">CardioGuard</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {variant === "landing" && (
            <>
              <a href="#how-it-works" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                How It Works
              </a>
              <a href="#features" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#architecture" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Architecture
              </a>
              <a href="#testimonials" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Testimonials
              </a>
            </>
          )}
          {variant === "patient" && (
            <>
              <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-foreground">
                Dashboard
              </Link>
              <Link to="/onboarding" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Settings
              </Link>
            </>
          )}
          {variant === "clinician" && (
            <Link to="/clinician" className="rounded-md px-3 py-2 text-sm font-medium text-foreground">
              Clinician Portal
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {variant === "landing" ? (
            <>
              <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/clinician">Clinician Login</Link>
              </Button>
              <Button asChild className="gradient-accent border-0 text-primary-foreground shadow-glow hover:opacity-90 transition-opacity">
                <Link to="/onboarding">Get Started</Link>
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild className="text-muted-foreground">
              <Link to="/">
                <Shield className="mr-2 h-4 w-4" />
                HIPAA Secured
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/30 glass-surface-strong p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {variant === "landing" && (
              <>
                <a href="#how-it-works" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>How It Works</a>
                <a href="#features" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Features</a>
                <Button asChild className="gradient-accent border-0 text-primary-foreground">
                  <Link to="/onboarding">Get Started</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/clinician">Clinician Login</Link>
                </Button>
              </>
            )}
            {variant === "patient" && (
              <>
                <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm text-foreground">Dashboard</Link>
                <Link to="/" className="rounded-md px-3 py-2 text-sm text-muted-foreground">Home</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
