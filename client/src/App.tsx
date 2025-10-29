import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import LandingPage from "@/components/LandingPage";
import PhoneVerification from "@/components/PhoneVerification";
import RegistrationForm, { type RegistrationData } from "@/components/RegistrationForm";
import Dashboard from "@/components/Dashboard";
import FindTeammates from "@/pages/FindTeammates";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";

type AppState = 'landing' | 'phone' | 'registration' | 'authenticated';

function Router() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [idToken, setIdToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setAppState('phone');
  };

  const handlePhoneVerified = async (token: string, phone: string) => {
    setLoading(true);
    setIdToken(token);
    setPhoneNumber(phone);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: token }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();
      
      if (data.userExists && data.user) {
        setUserData(data.user);
        setAppState('authenticated');
        setLocation('/dashboard');
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.user.fullName}`,
        });
      } else {
        setAppState('registration');
      }
    } catch (error: any) {
      console.error('Auth verification error:', error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationComplete = async (data: RegistrationData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const user = await response.json();
      setUserData(user);
      setAppState('authenticated');
      setLocation('/dashboard');
      
      toast({
        title: "Registration Complete! 🎉",
        description: `Welcome to Nirala Techie, ${user.fullName}! You've earned 50 points.`,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (appState === 'landing' || appState === 'phone' || appState === 'registration') {
    return (
      <Switch>
        <Route path="/">
          {appState === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
          {appState === 'phone' && <PhoneVerification onVerified={handlePhoneVerified} />}
          {appState === 'registration' && (
            <RegistrationForm phoneNumber={phoneNumber} idToken={idToken} onComplete={handleRegistrationComplete} />
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (appState === 'authenticated' && userData) {
    return (
      <Switch>
        <Route path="/dashboard">
          <Dashboard user={userData} />
        </Route>
        <Route path="/find-teammates">
          <FindTeammates userId={userData.id} idToken={idToken} />
        </Route>
        <Route path="/chat">
          <Chat userId={userData.id} idToken={idToken} />
        </Route>
        <Route path="/">
          <Dashboard user={userData} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <NotFound />;
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
