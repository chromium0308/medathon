"use client";

import Link from "next/link";
import { Heart, Shield, Menu, X, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = ({ variant = "landing" }: { variant?: "landing" | "patient" | "clinician" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent transition-transform group-hover:scale-110">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground tracking-tight">Ventria</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {variant === "landing" && (
            <>
              <Link href="/#how-it-works" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                How It Works
              </Link>
              <Link href="/#features" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="/#architecture" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Architecture
              </Link>
              <Link href="/#testimonials" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Testimonials
              </Link>
              <Link href="/apple-watch" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5">
                <Watch className="h-3.5 w-3.5" />
                Apple Watch
              </Link>
            </>
          )}
          {variant === "patient" && (
            <>
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-foreground">
                Dashboard
              </Link>
              <Link href="/#how-it-works" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                How It Works
              </Link>
              <Link href="/#features" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="/#architecture" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Architecture
              </Link>
              <Link href="/#testimonials" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Testimonials
              </Link>
              <Link href="/apple-watch" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5">
                <Watch className="h-3.5 w-3.5" />
                Apple Watch
              </Link>
              <Link href="/onboarding" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Settings
              </Link>
            </>
          )}
          {variant === "clinician" && (
            <Link href="/clinician" className="rounded-md px-3 py-2 text-sm font-medium text-foreground">
              Clinician Portal
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {variant === "landing" ? (
            <>
              <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/clinician">Clinician Login</Link>
              </Button>
              <Button asChild className="gradient-accent border-0 text-primary-foreground shadow-glow hover:opacity-90 transition-opacity">
                <Link href="/onboarding">Get Started</Link>
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild className="text-muted-foreground">
              <Link href="/">
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
                <Link href="/#how-it-works" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>How It Works</Link>
                <Link href="/#features" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Features</Link>
                <Link href="/#architecture" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Architecture</Link>
                <Link href="/#testimonials" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Testimonials</Link>
                <Link href="/apple-watch" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Apple Watch</Link>
                <Button asChild className="gradient-accent border-0 text-primary-foreground">
                  <Link href="/onboarding">Get Started</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/clinician">Clinician Login</Link>
                </Button>
              </>
            )}
            {variant === "patient" && (
              <>
                <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm text-foreground">Dashboard</Link>
                <Link href="/#how-it-works" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>How It Works</Link>
                <Link href="/#features" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Features</Link>
                <Link href="/#architecture" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Architecture</Link>
                <Link href="/#testimonials" className="rounded-md px-3 py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Testimonials</Link>
                <Link href="/apple-watch" className="rounded-md px-3 py-2 text-sm text-muted-foreground">Apple Watch</Link>
                <Link href="/" className="rounded-md px-3 py-2 text-sm text-muted-foreground">Home</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
