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
import EmailPasswordLogin from "@/components/EmailPasswordLogin";
import PasswordResetForm from "@/components/PasswordResetForm";
import PasswordResetAction from "@/components/PasswordResetAction";
import RegistrationForm, { type RegistrationData } from "@/components/RegistrationForm";
import Dashboard from "@/components/Dashboard";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import MyServices from "@/pages/MyServices";
import Settings from "@/pages/Settings";
import FindTeammates from "@/pages/FindTeammates";
import Chat from "@/pages/Chat";
import Notifications from "@/pages/Notifications";
import NotificationSettings from "@/pages/NotificationSettings";
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
import UserProfile from "@/pages/UserProfile";
import EventFeedback from "@/pages/EventFeedback";
import EventFeedbackDashboard from "@/pages/EventFeedbackDashboard";
import { BroadcastBanner } from "@/components/BroadcastBanner";
import { AuthProvider } from "@/hooks/useAuth";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatPopupManager from "@/components/ChatPopupManager";
import BottomNav from "@/components/BottomNav";
import OnboardingWizard from "@/components/OnboardingWizard";
import GlobalSearch from "@/components/GlobalSearch";
import NotFound from "@/pages/not-found";

type AppState = 'landing' | 'category' | 'email-login' | 'phone' | 'registration' | 'password-reset' | 'authenticated';
type AuthMode = 'login' | 'register';
type LoginMode = 'email' | 'phone';

function Router() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [loginMode, setLoginMode] = useState<LoginMode>('email');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [idToken, setIdToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const oobCode = urlParams.get('oobCode');

  // Sync showOnboarding state with userData
  useEffect(() => {
    if (userData && userData.onboardingCompleted === 0) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [userData]);

  if (mode === 'resetPassword' && oobCode) {
    return <PasswordResetAction />;
  }

  useEffect(() => {
    const restoreSession = async () => {
      const jwtToken = localStorage.getItem('accessToken');
      const jwtUser = localStorage.getItem('user');
      const firebaseToken = localStorage.getItem('idToken');
      const firebaseUser = localStorage.getItem('userData');
      
      // Prioritize JWT-based session (email/password login)
      if (jwtToken && jwtUser) {
        try {
          const user = JSON.parse(jwtUser);
          setIdToken(jwtToken);
          setUserData(user);
          setAppState('authenticated');
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error restoring JWT session:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
      
      // Fallback to Firebase token (phone OTP login)
      if (firebaseToken && firebaseUser) {
        try {
          const user = JSON.parse(firebaseUser);
          
          // Verify Firebase token
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: firebaseToken }),
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.userExists && data.user) {
              setIdToken(firebaseToken);
              setUserData(data.user);
              setAppState('authenticated');
              localStorage.setItem('userData', JSON.stringify(data.user));
            } else {
              console.warn('User account no longer exists in database');
              localStorage.removeItem('idToken');
              localStorage.removeItem('userData');
              toast({
                title: "Account Not Found",
                description: "Your account is no longer active. Please contact support if this is an error.",
                variant: "destructive",
              });
            }
          } else if (response.status === 403) {
            const errorData = await response.json();
            console.warn('Account suspended:', errorData.details);
            localStorage.removeItem('idToken');
            localStorage.removeItem('userData');
            toast({
              title: "Account Suspended",
              description: errorData.details || "Your account has been suspended. Please contact support.",
              variant: "destructive",
              duration: 10000,
            });
          } else if (response.status === 401) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Session invalidated:', errorData.details || 'Token expired');
            localStorage.removeItem('idToken');
            localStorage.removeItem('userData');
            if (errorData.forceLogout) {
              toast({
                title: "Security Notice",
                description: errorData.details || "Please log in again for security reasons.",
                variant: "default",
                duration: 8000,
              });
            }
          } else {
            console.warn('Token verification failed');
            localStorage.removeItem('idToken');
            localStorage.removeItem('userData');
          }
        } catch (error) {
          console.error('Error restoring auth state:', error);
          localStorage.removeItem('idToken');
          localStorage.removeItem('userData');
        }
      }
      setLoading(false);
    };

    restoreSession();
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

  const handleGetStarted = (mode: AuthMode, preferredLoginMode: LoginMode = 'email') => {
    setAuthMode(mode);
    setLoginMode(preferredLoginMode);
    
    if (mode === 'login') {
      if (preferredLoginMode === 'email') {
        setAppState('email-login');
      } else {
        setAppState('phone');
      }
    } else {
      setAppState('category');
    }
  };

  const handleEmailLoginSuccess = async (accessToken: string) => {
    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!userData || !userData.id) {
        throw new Error('User data not found');
      }

      setUserData(userData);
      setIdToken(accessToken);
      setAppState('authenticated');
      setLocation('/dashboard');
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.fullName}`,
      });
    } catch (error: any) {
      console.error('Auth verification error:', error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAppState('landing');
    } finally {
      setLoading(false);
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
        if (authMode === 'login' && loginMode === 'phone') {
          // User is resetting password via phone OTP - show password reset form
          setUserData(data.user);
          setAppState('password-reset');
          toast({
            title: "Phone Verified!",
            description: "Now set your new password to complete the reset",
          });
        } else {
          // Normal login flow
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
        }
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

  const handlePasswordResetComplete = async (newPassword: string) => {
    setLoading(true);
    try {
      const { EmailPasswordAuthService } = await import('@/lib/firebase');
      const emailPasswordService = new EmailPasswordAuthService();
      
      // Step 1: Update password in Firebase
      await emailPasswordService.updateUserPassword(newPassword);
      console.log('[Password Reset] Firebase password updated');
      
      // Step 2: Update password in PostgreSQL database
      // This is critical - without this step, email/password login will fail
      const dbUpdateResponse = await fetch('/api/auth/update-password-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: idToken,
          newPassword: newPassword,
        }),
      });

      if (!dbUpdateResponse.ok) {
        const errorData = await dbUpdateResponse.json();
        throw new Error(errorData.error || 'Failed to update password in database');
      }

      console.log('[Password Reset] PostgreSQL password updated');
      
      // Step 3: Sign in with the new password to get a fresh token
      if (userData && userData.email) {
        const freshToken = await emailPasswordService.signInWithEmail(userData.email, newPassword);
        setIdToken(freshToken);
        setAppState('authenticated');
        localStorage.setItem('idToken', freshToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setLocation('/dashboard');
        
        toast({
          title: "Password Reset Successful! 🎉",
          description: "You can now login with email/password anytime.",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = "Failed to update password. Please try again.";
      if (error.message?.includes('database')) {
        errorMessage = "Password updated in Firebase but not in database. Please contact support.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Session expired. Please verify your phone number again.";
      }
      
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationComplete = async (data: RegistrationData) => {
    setLoading(true);
    let tokenToUse = idToken;
    
    try {
      if (data.email && data.password) {
        const { EmailPasswordAuthService } = await import('@/lib/firebase');
        const emailPasswordService = new EmailPasswordAuthService();
        
        try {
          await emailPasswordService.linkEmailPassword(data.email, data.password);
          const freshToken = await emailPasswordService.signInWithEmail(data.email, data.password);
          tokenToUse = freshToken;
          setIdToken(freshToken);
          
          toast({
            title: "Email/Password Linked!",
            description: "You can now login with email and password anytime.",
          });
        } catch (linkError: any) {
          console.error('Error linking email/password:', linkError);
          toast({
            title: "Warning",
            description: "Email/password linking failed. You can still use phone login.",
            variant: "destructive",
          });
        }
      }

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: tokenToUse,
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
      localStorage.setItem('idToken', tokenToUse);
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

  if (appState === 'landing' || appState === 'category' || appState === 'email-login' || appState === 'phone' || appState === 'registration' || appState === 'password-reset') {
    return (
      <Switch>
        {/* Public feedback route - works without authentication */}
        <Route path="/feedback/:eventId" component={EventFeedback} />
        
        <Route path="/">
          {appState === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
          {appState === 'category' && <CategorySelector onContinue={handleCategorySelected} />}
          {appState === 'email-login' && (
            <EmailPasswordLogin 
              onLoginSuccess={handleEmailLoginSuccess}
              onBackToLanding={() => setAppState('landing')}
              onSwitchToPhoneLogin={() => {
                setAuthMode('login');
                setLoginMode('phone');
                setAppState('phone');
              }}
            />
          )}
          {appState === 'phone' && <PhoneVerification onVerified={handlePhoneVerified} />}
          {appState === 'password-reset' && (
            <PasswordResetForm
              phoneNumber={phoneNumber}
              onPasswordReset={handlePasswordResetComplete}
              onCancel={() => setAppState('landing')}
            />
          )}
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
      setShowOnboarding(false);
    };

    const handleOnboardingDefer = () => {
      setShowOnboarding(false);
    };

    return (
      <AuthProvider initialUser={userData} initialToken={idToken}>
        <ChatProvider>
          <BroadcastBanner />
          {/* Hide search bar on public feedback pages */}
          {!window.location.pathname.startsWith('/feedback/') && (
            <div className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
              <GlobalSearch idToken={idToken} />
            </div>
          )}
          <ChatPopupManager />
          <BottomNav />
          <OnboardingWizard
            open={showOnboarding && userData.onboardingCompleted === 0}
            onComplete={handleOnboardingComplete}
            onDefer={handleOnboardingDefer}
            userId={userData.id}
            idToken={idToken}
          />
          <Switch>
          {/* Public feedback route - works without authentication */}
          <Route path="/feedback/:eventId" component={EventFeedback} />
          
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
          <Route path="/events/:eventId/feedback-dashboard">
            <EventFeedbackDashboard userId={userData.id} idToken={idToken} />
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
          {/* Redirect for backwards compatibility */}
          <Route path="/lost-found">
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
          <Route path="/find-teammates">
            <FindTeammates userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/profile/edit">
            <ProfileEdit userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/profile/:userId">
            <UserProfile userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/profile">
            <Profile user={userData} userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/my-services">
            <MyServices userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/settings">
            <Settings idToken={idToken} />
          </Route>
          <Route path="/dashboard">
            <Dashboard user={userData} userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/chat">
            <Chat userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/notification-settings">
            <NotificationSettings userId={userData.id} idToken={idToken} />
          </Route>
          <Route path="/notifications">
            <Notifications userId={userData.id} idToken={idToken} />
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
