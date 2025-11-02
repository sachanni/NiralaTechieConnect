import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import LandingPage from "@/components/LandingPage";
import CategorySelector from "@/pages/CategorySelector";
import PhoneVerification from "@/components/PhoneVerification";
import RegistrationForm, { type RegistrationData } from "@/components/RegistrationForm";
import Dashboard from "@/components/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import FindTeammates from "@/pages/FindTeammates";
import Chat from "@/pages/Chat";
import JobBoard from "@/pages/JobBoard";
import PostJob from "@/pages/PostJob";
import MyJobs from "@/pages/MyJobs";
import MyApplications from "@/pages/MyApplications";
import ViewApplicants from "@/pages/ViewApplicants";
import IdeaWall from "@/pages/IdeaWall";
import IdeaDetails from "@/pages/IdeaDetails";
import MyIdeas from "@/pages/MyIdeas";
import MyTeamApplications from "@/pages/MyTeamApplications";
import SkillSwap from "@/pages/SkillSwap";
import MySessions from "@/pages/MySessions";
import Events from "@/pages/Events";
import EventDetails from "@/pages/EventDetails";
import EventQRCode from "@/pages/EventQRCode";
import EventScanner from "@/pages/EventScanner";
import EventAttendees from "@/pages/EventAttendees";
import MyEvents from "@/pages/MyEvents";
import CreateEditEvent from "@/pages/CreateEditEvent";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminApprovals from "@/pages/AdminApprovals";
import AdminBroadcasts from "@/pages/AdminBroadcasts";
import AdminExports from "@/pages/AdminExports";
import AdminActivityLog from "@/pages/AdminActivityLog";
import Forum from "@/pages/Forum";
import ForumCategory from "@/pages/ForumCategory";
import AskQuestion from "@/pages/AskQuestion";
import QuestionDetail from "@/pages/QuestionDetail";
import ServicesHub from "@/pages/ServicesHub";
import ServiceListingPage from "@/pages/ServiceListingPage";
import LostAndFoundPage from "@/pages/LostAndFoundPage";
import CommunityAnnouncementsPage from "@/pages/CommunityAnnouncementsPage";
import ActivityFeed from "@/pages/ActivityFeed";
import PhotoGallery from "@/pages/PhotoGallery";
import Marketplace from "@/pages/Marketplace";
import ToolRental from "@/pages/ToolRental";
import AdvertiseServices from "@/pages/AdvertiseServices";
import { BroadcastBanner } from "@/components/BroadcastBanner";
import { AuthProvider } from "@/hooks/useAuth";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatPopupManager from "@/components/ChatPopupManager";
import BottomNav from "@/components/BottomNav";
import OnboardingWizard from "@/components/OnboardingWizard";
import GlobalSearch from "@/components/GlobalSearch";
import NotFound from "@/pages/not-found";

type AppState = 'landing' | 'category' | 'phone' | 'registration' | 'authenticated';
type AuthMode = 'login' | 'register';

function Router() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [idToken, setIdToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('idToken');
    const storedUser = localStorage.getItem('userData');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIdToken(storedToken);
        setUserData(user);
        setAppState('authenticated');
      } catch (error) {
        console.error('Error restoring auth state:', error);
        localStorage.removeItem('idToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (appState !== 'authenticated') return;

    const refreshToken = async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          const freshToken = await currentUser.getIdToken(true);
          setIdToken(freshToken);
          localStorage.setItem('idToken', freshToken);
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        localStorage.removeItem('idToken');
        localStorage.removeItem('userData');
        setAppState('landing');
        setLocation('/');
      }
    };

    const interval = setInterval(refreshToken, 50 * 60 * 1000);
    
    const timeoutId = setTimeout(refreshToken, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [appState, toast, setLocation]);

  const handleGetStarted = (mode: AuthMode) => {
    setAuthMode(mode);
    // Skip category selection for login - go straight to phone verification
    if (mode === 'login') {
      setAppState('phone');
    } else {
      setAppState('category');
    }
  };

  const handleCategorySelected = (categories: string[]) => {
    setSelectedCategories(categories);
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
        // User exists in database
        setUserData(data.user);
        setIdToken(token);
        setAppState('authenticated');
        localStorage.setItem('idToken', token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setLocation('/dashboard');
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.user.fullName}`,
        });
      } else {
        // User doesn't exist in database
        if (authMode === 'login') {
          // User tried to login but account doesn't exist
          toast({
            title: "Account Not Found",
            description: "No account found with this phone number. Please register first.",
            variant: "destructive",
          });
          setAppState('landing');
        } else {
          // User is registering - proceed to registration flow
          setAppState('registration');
        }
      }
    } catch (error: any) {
      console.error('Auth verification error:', error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
      setAppState('landing');
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
      localStorage.setItem('idToken', idToken);
      localStorage.setItem('userData', JSON.stringify(user));
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

  if (appState === 'landing' || appState === 'category' || appState === 'phone' || appState === 'registration') {
    return (
      <Switch>
        <Route path="/">
          {appState === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
          {appState === 'category' && <CategorySelector onContinue={handleCategorySelected} />}
          {appState === 'phone' && <PhoneVerification onVerified={handlePhoneVerified} />}
          {appState === 'registration' && (
            <RegistrationForm 
              phoneNumber={phoneNumber} 
              idToken={idToken} 
              selectedCategories={selectedCategories}
              onComplete={handleRegistrationComplete} 
            />
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (appState === 'authenticated' && userData) {
    const handleOnboardingComplete = async () => {
      const updatedUser = { ...userData, onboardingCompleted: 1 };
      setUserData(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    };

    return (
      <AuthProvider initialUser={userData} initialToken={idToken}>
        <ChatProvider>
          <BroadcastBanner />
          <div className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
            <GlobalSearch idToken={idToken} />
          </div>
          <ChatPopupManager />
          <BottomNav />
          <OnboardingWizard
            open={userData.onboardingCompleted === 0}
            onComplete={handleOnboardingComplete}
            userId={userData.id}
            idToken={idToken}
          />
          <Switch>
          {/* Admin routes - must be first for proper matching */}
          <Route path="/admin/activity-log">
            <AdminActivityLog />
          </Route>
          <Route path="/admin/exports">
            <AdminExports />
          </Route>
          <Route path="/admin/broadcasts">
            <AdminBroadcasts />
          </Route>
          <Route path="/admin/approvals">
            <AdminApprovals />
          </Route>
          <Route path="/admin">
            <AdminDashboard />
          </Route>
          
          {/* Job routes */}
          <Route path="/jobs/:id/applicants">
            <ViewApplicants idToken={idToken} />
          </Route>
          <Route path="/post-job">
            <PostJob idToken={idToken} />
          </Route>
          <Route path="/my-jobs">
            <MyJobs userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/my-applications">
            <MyApplications userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/jobs">
            <JobBoard userId={userData.id} idToken={idToken} />
          </Route>
          
          {/* Idea routes */}
          <Route path="/ideas/:id">
            <IdeaDetails userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/my-ideas">
            <MyIdeas userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/my-team-applications">
            <MyTeamApplications idToken={idToken} />
          </Route>
          <Route path="/ideas">
            <IdeaWall userId={userData.id} idToken={idToken} />
          </Route>
          
          {/* Skill Swap routes */}
          <Route path="/my-sessions">
            <MySessions userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/skill-swap">
            <SkillSwap userId={userData.id} idToken={idToken} />
          </Route>
          
          {/* Events routes */}
          <Route path="/events/create">
            <CreateEditEvent userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/events/:id/edit">
            <CreateEditEvent userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/events/:id/scan">
            <EventScanner userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/events/:id/qr-code">
            <EventQRCode userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/events/:id/attendees">
            <EventAttendees userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/events/:id">
            <EventDetails userId={userData.id} idToken={idToken} />
          </Route>
          
          {/* Forum routes */}
          <Route path="/forum/ask">
            <AskQuestion idToken={idToken} />
          </Route>
          <Route path="/forum/post/:id">
            <QuestionDetail />
          </Route>
          <Route path="/forum/category/:slug">
            <ForumCategory />
          </Route>
          <Route path="/forum">
            <Forum idToken={idToken} />
          </Route>
          <Route path="/my-events">
            <MyEvents userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/events">
            <Events userId={userData.id} idToken={idToken} />
          </Route>
          
          {/* Service routes */}
          <Route path="/services/:categoryId">
            <ServiceListingPage />
          </Route>
          <Route path="/services">
            <ServicesHub />
          </Route>
          
          {/* Community Features */}
          <Route path="/lost-and-found">
            <LostAndFoundPage idToken={idToken} />
          </Route>
          <Route path="/announcements">
            <CommunityAnnouncementsPage idToken={idToken} />
          </Route>
          <Route path="/activity-feed">
            <ActivityFeed userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/photo-gallery">
            <PhotoGallery userId={userData.id} idToken={idToken} />
          </Route>
          
          {/* Phase 2 Features */}
          <Route path="/marketplace">
            <Marketplace />
          </Route>
          <Route path="/tool-rental">
            <ToolRental />
          </Route>
          <Route path="/advertise">
            <AdvertiseServices />
          </Route>
          
          {/* Other routes */}
          <Route path="/profile">
            <Profile user={userData} userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/settings">
            <Settings idToken={idToken} />
          </Route>
          <Route path="/dashboard">
            <Dashboard user={userData} userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/find-teammates">
            <FindTeammates userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/chat">
            <Chat userId={userData.id} idToken={idToken} />
          </Route>
          
          {/* Default route */}
          <Route path="/">
            <Dashboard user={userData} userId={userData.id} idToken={idToken} />
          </Route>
          
          {/* 404 catch-all */}
          <Route component={NotFound} />
        </Switch>
        </ChatProvider>
      </AuthProvider>
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
