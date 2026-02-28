import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AdvisingSession from "@/pages/AdvisingSession";
import AIPlayground from "@/pages/AIPlayground";
import StorageDemo from "@/pages/StorageDemo";
import Algorithms from "@/pages/Algorithms";
import ProfileSetup from "@/pages/ProfileSetup";
import Login from "@/pages/Login";
import Quiz from "@/pages/Quiz";
import Jobs from "@/pages/Jobs";
import MockInterview from "@/pages/MockInterview";
import ResumeAnalyzer from "@/pages/ResumeAnalyzer";
import ProjectsAndSkills from "@/pages/ProjectsAndSkills";
import LearningResources from "@/pages/LearningResources";
import GameCenter from "@/pages/GameCenter";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Set to true for demo
  
  useEffect(() => {
    // Auto-authenticate for demo purposes
    setIsAuthenticated(true);
    
    // Check initialization status
    fetch('/api/initialization')
      .then(res => res.json())
      .then(data => {
        console.log('Initialization response:', data);
        setIsInitialized(data.isInitialized);
        setHasProfile(data.hasProfile);
      })
      .catch((err) => {
        console.error('Initialization check failed:', err);
        setIsInitialized(false);
        setHasProfile(false);
      });
  }, []);

  // Show loading while checking both auth and initialization
  if (isAuthenticated === null || isInitialized === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    setHasProfile(false);
    setIsInitialized(false);
    setLocation('/login');
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show profile setup if user is authenticated but has no profile
  if (isAuthenticated && !hasProfile) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto w-full relative z-10">
          <ProfileSetup />
        </main>
      </div>
    );
  }

  // Show sidebar for all pages
  const showSidebar = true;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showSidebar && <Sidebar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        <Switch>
          <Route path="/" component={isInitialized ? Dashboard : ProfileSetup} />
          <Route path="/setup" component={ProfileSetup} />
          <Route path="/login" component={Login} />
          <Route path="/quiz" component={Quiz} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/advise" component={AdvisingSession} />
          <Route path="/ai-playground" component={AIPlayground} />
          <Route path="/storage-demo" component={StorageDemo} />
          <Route path="/algorithms" component={Algorithms} />
          <Route path="/mock-interview" component={MockInterview} />
          <Route path="/resume-analyzer" component={ResumeAnalyzer} />
          <Route path="/projects" component={ProjectsAndSkills} />
          <Route path="/resources" component={LearningResources} />
          <Route path="/game" component={GameCenter} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
