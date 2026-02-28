import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, MessageSquare, Sparkles, Wand2, Database, Code, LogOut, User, GraduationCap, Briefcase, Menu, X, Rocket, BookOpen, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Job Market", icon: Briefcase },
  { href: "/quiz", label: "Skill Assessment", icon: GraduationCap },
  { href: "/advise", label: "AI Advisor", icon: MessageSquare },
  { href: "/ai-playground", label: "AI Playground", icon: Wand2 },
  { href: "/projects", label: "Projects & Skills", icon: Rocket },
  { href: "/resources", label: "Learning Resources", icon: BookOpen },
  { href: "/game", label: "Game Center", icon: Trophy },
  { href: "/algorithms", label: "Algorithms", icon: Code },
  { href: "/storage-demo", label: "Data Storage", icon: Database },
];

export function Sidebar({ isAuthenticated, onLogout }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={cn(
        "w-64 h-full glass-panel border-r border-y-0 border-l-0 flex flex-col z-40",
        // Mobile styles
        "lg:relative fixed left-0 top-0 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex items-center gap-3">
          <img 
            src="/entresst-logo.png" 
            alt="Entresst Logo" 
            className="w-10 h-10 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-gradient">Entresst</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-secondary" /> AI Powered
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-3">
          {/* User Info */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {isAuthenticated ? 'Logged In' : 'Guest User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {isAuthenticated ? 'Premium Member' : 'Sign in for more'}
                </p>
              </div>
            </div>
          </div>

          {/* Login/Logout Buttons */}
          <div className="flex gap-2">
            {!isAuthenticated && (
              <Link href="/login" onClick={closeMobileMenu}>
                <Button variant="outline" size="sm" className="flex-1">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            {isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  onLogout();
                  closeMobileMenu();
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

