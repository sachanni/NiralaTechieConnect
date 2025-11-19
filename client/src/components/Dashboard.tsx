import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Sparkles, TrendingUp, Menu, X, Home, Users, Briefcase, MessageCircle, Bell, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import confetti from 'canvas-confetti';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AccountMenu from "./AccountMenu";
import GlobalSearch from "./GlobalSearch";
import HeaderNavItem from "./HeaderNavItem";
import UserProfileSidebar from "./UserProfileSidebar";
import SuggestionsSidebar from "./SuggestionsSidebar";
import ActivityFeedItem from "./ActivityFeedItem";
import NotificationDropdown from "./NotificationDropdown";
import ProfileCompletionIndicator from "./ProfileCompletionIndicator";
import { Skeleton } from "./ui/skeleton";

interface DashboardProps {
  user: {
    fullName: string;
    email: string;
    flatNumber: string;
    profilePhotoUrl?: string;
    points?: number;
    badges?: string[];
    dateOfBirth?: string;
    towerName?: string;
    bio?: string;
    occupation?: string;
    employmentStatus?: string;
    company?: string;
    yearsOfExperience?: number;
    briefIntro?: string;
    professionalWebsite?: string;
    serviceCategories?: string[];
    categoryRoles?: Record<string, string[]>;
    techStack?: string[];
    certifications?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  userId: string;
  idToken: string;
}

export default function Dashboard({ user, userId, idToken }: DashboardProps) {
  const [, setLocation] = useLocation();
  const [feedFilter, setFeedFilter] = useState<"all" | "following" | "interests" | "discussions">("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const leftSidebarContainerRef = useRef<HTMLElement>(null);
  const rightSidebarContainerRef = useRef<HTMLElement>(null);
  const [leftSidebarShort, setLeftSidebarShort] = useState(false);
  const [rightSidebarShort, setRightSidebarShort] = useState(false);
  const [leftSidebarLeft, setLeftSidebarLeft] = useState(0);
  const [rightSidebarRight, setRightSidebarRight] = useState(0);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(0);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkSidebarHeights = () => {
      const headerHeight = 88;
      const availableHeight = window.innerHeight - headerHeight;

      if (leftSidebarContainerRef.current) {
        const containerRect = leftSidebarContainerRef.current.getBoundingClientRect();
        setLeftSidebarLeft(containerRect.left);
        setLeftSidebarWidth(containerRect.width);
      }

      if (rightSidebarRef.current && rightSidebarContainerRef.current) {
        const rightHeight = rightSidebarRef.current.scrollHeight;
        const isShort = rightHeight < availableHeight;
        setRightSidebarShort(isShort);
        
        if (isShort) {
          const containerRect = rightSidebarContainerRef.current.getBoundingClientRect();
          setRightSidebarRight(window.innerWidth - containerRect.right);
          setRightSidebarWidth(containerRect.width);
        }
      }
    };

    const timeoutId = setTimeout(checkSidebarHeights, 100);

    const resizeObserver = new ResizeObserver(checkSidebarHeights);
    if (leftSidebarContainerRef.current) resizeObserver.observe(leftSidebarContainerRef.current);
    if (rightSidebarRef.current) resizeObserver.observe(rightSidebarRef.current);

    window.addEventListener('resize', checkSidebarHeights);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkSidebarHeights);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Clear JWT tokens (email/password login)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Clear Firebase tokens (phone OTP login)
      localStorage.removeItem('idToken');
      localStorage.removeItem('userData');
      
      // Try to sign out from Firebase (if user was logged in via phone OTP)
      try {
        const { getAuth, signOut } = await import('firebase/auth');
        const auth = getAuth();
        await signOut(auth);
      } catch (firebaseError) {
        // Ignore Firebase signout errors (user might not be logged in via Firebase)
      }
      
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if there's an error
      window.location.href = '/';
    }
  };

  const { data: activityData, isLoading: activityLoading } = useQuery<{ activities: any[] }>({
    queryKey: ['activity-feed', feedFilter],
    queryFn: async () => {
      const response = await fetch(`/api/activity-feed?limit=20&filter=${feedFilter}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) return { activities: [] };
      return response.json();
    },
    enabled: !!idToken,
    refetchInterval: 30000,
  });

  const { data: usersData } = useQuery<{ users: any[] }>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/search?excludeUserId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: eventsData } = useQuery<{ events: any[] }>({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const { data: jobsData } = useQuery<{ jobs: any[] }>({
    queryKey: ['recent-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  const { data: servicesData } = useQuery<{ services: any[] }>({
    queryKey: ['user-services', userId],
    queryFn: async () => {
      const response = await fetch('/api/users/services', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { services: [] };
      return response.json();
    },
    enabled: !!idToken,
  });

  const { data: unreadMessagesData } = useQuery<{ count: number }>({
    queryKey: ['unread-messages', userId],
    queryFn: async () => {
      const response = await fetch('/api/messages/unread/count', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { count: 0 };
      return response.json();
    },
    enabled: !!idToken,
    refetchInterval: 30000,
  });

  const { data: unreadNotificationsData } = useQuery<{ count: number }>({
    queryKey: ['unread-notifications', userId],
    queryFn: async () => {
      const response = await fetch('/api/notifications/unread/count', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { count: 0 };
      return response.json();
    },
    enabled: !!idToken,
    refetchInterval: 30000,
  });

  const activities = activityData?.activities || [];
  const neighbors = usersData?.users?.slice(0, 5) || [];
  // Count unique services (not total records, since one service can have both provider and seeker roles)
  const servicesCount = servicesData?.services 
    ? new Set(servicesData.services.map((s: any) => s.serviceId)).size 
    : 0;
  const upcomingEvents = eventsData?.events?.filter((e: any) => {
    try {
      return new Date(e.eventDate) >= new Date() && e.status === 'upcoming';
    } catch {
      return false;
    }
  }).slice(0, 3) || [];
  const recentJobs = jobsData?.jobs?.slice(0, 3) || [];

  const stats = {
    totalMembers: (usersData?.users?.length || 0) + 1,
    activeToday: Math.floor(((usersData?.users?.length || 0) + 1) * 0.3),
    totalServices: 150,
  };

  const userStats = {
    contributions: activities.filter((a) => a.userId === userId).length,
    connections: Math.floor((usersData?.users?.length || 0) * 0.2),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left Zone: Menu + Logo + Search */}
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <UserProfileSidebar user={user} stats={userStats} />
                  </div>
                </SheetContent>
              </Sheet>
              <Rocket className="w-6 h-6 text-primary flex-shrink-0" />
              <div className="hidden md:block flex-1 max-w-xs">
                <GlobalSearch idToken={idToken} />
              </div>
            </div>

            {/* Center Zone: Icon Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <HeaderNavItem icon={Home} label="Home" href="/" />
              <HeaderNavItem icon={Users} label="Network" href="/find-teammates" />
              <HeaderNavItem icon={Briefcase} label="Jobs" href="/jobs" />
              <HeaderNavItem icon={MessageCircle} label="Messages" href="/chat" badge={unreadMessagesData?.count || 0} />
              <HeaderNavItem icon={Bell} label="Notifications" href="/notifications" badge={unreadNotificationsData?.count || 0} />
            </div>

            {/* Right Zone: Notifications + Account Menu */}
            <div className="flex items-center gap-2">
              <NotificationDropdown idToken={idToken} userId={userId} />
              <AccountMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pt-[88px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside ref={leftSidebarContainerRef} className="lg:col-span-3 hidden lg:block">
            <div 
              ref={leftSidebarRef}
              className="fixed top-[88px] overflow-y-auto space-y-4"
              style={{ 
                left: `${leftSidebarLeft || 0}px`, 
                width: `${leftSidebarWidth || 0}px`,
                maxHeight: 'calc(100vh - 88px)'
              }}
            >
              <UserProfileSidebar user={user} stats={userStats} />
              <ProfileCompletionIndicator user={user} compact showDetails={false} />
            </div>
          </aside>

          <main className="lg:col-span-6">
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Activity Feed
                    </CardTitle>
                    <Tabs value={feedFilter} onValueChange={setFeedFilter}>
                      <TabsList className="h-9">
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                        <TabsTrigger value="following" className="text-xs">Following</TabsTrigger>
                        <TabsTrigger value="interests" className="text-xs">My Interests</TabsTrigger>
                        <TabsTrigger value="discussions" className="text-xs">Discussions</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <ActivityFeedItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No activities yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to post something!
                  </p>
                </CardContent>
              </Card>
            )}
          </main>

          <aside ref={rightSidebarContainerRef} className="lg:col-span-3 hidden lg:block">
            <div 
              ref={rightSidebarRef}
              className={rightSidebarShort ? "fixed top-[88px]" : "sticky top-[88px]"}
              style={rightSidebarShort ? { right: `${rightSidebarRight}px`, width: `${rightSidebarWidth}px` } : undefined}
            >
              <SuggestionsSidebar 
                neighbors={neighbors}
                events={upcomingEvents}
                jobs={recentJobs}
                servicesCount={servicesCount}
                stats={stats}
              />
            </div>
          </aside>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 z-10">
            <div className="flex justify-around items-center">
              <button onClick={() => setMobileMenuOpen(true)} className="text-center flex-1 py-2">
                <div className="text-2xl">☰</div>
                <div className="text-xs">Menu</div>
              </button>
              <button onClick={() => setLocation('/events')} className="text-center flex-1 py-2">
                <div className="text-2xl">📅</div>
                <div className="text-xs">Events</div>
              </button>
              <button onClick={() => setLocation('/jobs')} className="text-center flex-1 py-2">
                <div className="text-2xl">💼</div>
                <div className="text-xs">Jobs</div>
              </button>
              <button onClick={() => setLocation('/profile')} className="text-center flex-1 py-2">
                <div className="text-2xl">👤</div>
                <div className="text-xs">Profile</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
