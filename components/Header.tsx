"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatedThemeToggler } from "./AnimatedThemeToggler";

const navLinks = [
  { name: "Nội Quy", sectionId: "rules" },
  { name: "Cách Tham Gia", sectionId: "join" }
] as const;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-border bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">AT</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">AnhTong</h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map(link => (
              <Button
                key={link.name}
                variant="ghost"
                onClick={() => scrollToSection(link.sectionId)}
                className="font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold ">
              Đăng Nhập
            </Button> */}

            <AnimatedThemeToggler />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-accent/20 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
              {navLinks.map(link => (
                <Button
                  key={link.name}
                  variant="ghost"
                  onClick={() => scrollToSection(link.sectionId)}
                  className="font-medium text-muted-foreground hover:text-foreground transition-colors text-left py-2"
                >
                  {link.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
