import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rocket, Users, Briefcase, Lightbulb, CalendarDays, MessagesSquare, ArrowRight, TrendingUp, Shield, GraduationCap, Search, Megaphone, ShoppingCart, Wrench, Megaphone as AdvertiseIcon, UtensilsCrossed, Car, Gift, Baby, BookOpen, Heart, Sparkles, Activity as ActivityIcon, Camera } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import confetti from 'canvas-confetti';
import { formatDistanceToNow } from "date-fns";
import AccountMenu from "./AccountMenu";

interface DashboardProps {
  user: {
    fullName: string;
    profilePhotoUrl?: string;
  };
  userId: string;
  idToken: string;
}

export default function Dashboard({ user, userId, idToken }: DashboardProps) {
  const [, setLocation] = useLocation();

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

  const handleLogout = async () => {
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const auth = getAuth();
      await signOut(auth);
      
      localStorage.removeItem('idToken');
      localStorage.removeItem('userData');
      
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const { data: usersData } = useQuery<{ users: any[] }>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/search?excludeUserId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch users');
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
    refetchInterval: 10000,
  });

  const { data: ideasData } = useQuery<{ ideas: any[] }>({
    queryKey: ['recent-ideas'],
    queryFn: async () => {
      const response = await fetch('/api/ideas', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: eventsData } = useQuery<{ events: any[] }>({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: forumData } = useQuery<{ posts: any[] }>({
    queryKey: ['recent-forum-posts'],
    queryFn: async () => {
      const response = await fetch('/api/forum/posts?limit=5&sortBy=recent');
      if (!response.ok) throw new Error('Failed to fetch forum posts');
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: mentorsData } = useQuery<{ matches: any[] }>({
    queryKey: ['/api/skill-swap/matches'],
    queryFn: async () => {
      const response = await fetch('/api/skill-swap/matches', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) return { matches: [] };
      return response.json();
    },
    enabled: !!idToken,
    refetchInterval: 10000,
  });

  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ['admin-check'],
    queryFn: async () => {
      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) return { isAdmin: false };
      return response.json();
    },
    enabled: !!idToken,
    retry: false,
    meta: {
      errorHandler: 'none', // Silent check - don't show error toasts for non-admin users
    },
  });

  const { data: lostFoundData } = useQuery<{ items: any[] }>({
    queryKey: ['lost-found-count'],
    queryFn: async () => {
      const response = await fetch('/api/lost-found');
      if (!response.ok) return { items: [] };
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: announcementsData } = useQuery<{ announcements: any[] }>({
    queryKey: ['announcements-count'],
    queryFn: async () => {
      const response = await fetch('/api/announcements/active');
      if (!response.ok) return { announcements: [] };
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: galleriesData } = useQuery<{ galleries: any[] }>({
    queryKey: ['galleries-count'],
    queryFn: async () => {
      const response = await fetch('/api/galleries');
      if (!response.ok) return { galleries: [] };
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: activityData } = useQuery<{ activities: any[] }>({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const response = await fetch('/api/activity-feed?limit=5', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) return { activities: [] };
      return response.json();
    },
    enabled: !!idToken,
    refetchInterval: 10000,
  });

  const recentJobs = jobsData?.jobs?.slice(0, 5) || [];
  const latestIdeas = ideasData?.ideas?.slice(0, 4) || [];
  const upcomingEvents = eventsData?.events?.filter((e: any) => {
    try {
      return new Date(e.eventDate) >= new Date() && e.status === 'upcoming';
    } catch {
      return false;
    }
  }).slice(0, 3) || [];
  const recentForumPosts = forumData?.posts || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 md:gap-3">
              <Rocket className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h1 className="text-lg md:text-2xl font-bold text-foreground">Nirala Estate</h1>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AccountMenu user={user} onLogout={handleLogout} />
              <div>
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <h2 className="text-lg md:text-xl font-semibold text-foreground">{user.fullName.split(' ')[0]}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {adminCheck?.isAdmin && (
          <Card className="mb-4 md:mb-6 border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover-elevate cursor-pointer" onClick={() => setLocation('/admin')}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 md:pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                <CardTitle className="text-sm md:text-base font-semibold">Admin Panel</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-purple-600 text-white text-xs">Admin</Badge>
            </CardHeader>
            <CardContent className="hidden md:block">
              <p className="text-sm text-muted-foreground">
                Manage platform settings, approve ideas, send broadcasts, and view analytics
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4">Platform Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/lost-found')}>
              <CardContent className="p-4 md:p-6 text-center">
                <Search className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm md:text-base mb-1">Lost & Found</h3>
                <p className="text-xs text-muted-foreground mb-2">Post lost or found items</p>
                <Badge variant="secondary">{lostFoundData?.items?.length || 0} items</Badge>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/announcements')}>
              <CardContent className="p-4 md:p-6 text-center">
                <Megaphone className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm md:text-base mb-1">Announcements</h3>
                <p className="text-xs text-muted-foreground mb-2">Community updates</p>
                <Badge variant="secondary">{announcementsData?.announcements?.length || 0} active</Badge>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/photo-gallery')}>
              <CardContent className="p-4 md:p-6 text-center">
                <Camera className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm md:text-base mb-1">Photo Gallery</h3>
                <p className="text-xs text-muted-foreground mb-2">Community photos</p>
                <Badge variant="secondary">{galleriesData?.galleries?.length || 0} albums</Badge>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/marketplace')}>
              <CardContent className="p-4 md:p-6 text-center">
                <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm md:text-base mb-1">Marketplace</h3>
                <p className="text-xs text-muted-foreground mb-2">Buy, sell, exchange</p>
                <Badge variant="secondary" className="bg-green-600 text-white">New</Badge>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/tool-rental')}>
              <CardContent className="p-4 md:p-6 text-center">
                <Wrench className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm md:text-base mb-1">Tool Rental</h3>
                <p className="text-xs text-muted-foreground mb-2">Rent or lend tools</p>
                <Badge variant="secondary" className="bg-green-600 text-white">New</Badge>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/advertise')}>
              <CardContent className="p-4 md:p-6 text-center">
                <AdvertiseIcon className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm md:text-base mb-1">Advertise</h3>
                <p className="text-xs text-muted-foreground mb-2">Promote your services</p>
                <Badge variant="secondary" className="bg-green-600 text-white">New</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4">Service Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">🍰</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Food Network</h3>
                <p className="text-xs text-muted-foreground">Tiffin, catering, baking</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">🚗</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Smart Mobility</h3>
                <p className="text-xs text-muted-foreground">Carpool, school run</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">🎁</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Group Buying</h3>
                <p className="text-xs text-muted-foreground">Bulk purchases, gifts</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">👶</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Kids & Parenting</h3>
                <p className="text-xs text-muted-foreground">Babysitting, playdates</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">📚</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Learning & Classes</h3>
                <p className="text-xs text-muted-foreground">Music, dance, tuition</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">🏥</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Health & Wellness</h3>
                <p className="text-xs text-muted-foreground">Doctor, yoga, therapy</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">💼</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Professional</h3>
                <p className="text-xs text-muted-foreground">Career, mentoring</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">💅</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Beauty & Care</h3>
                <p className="text-xs text-muted-foreground">Salon, mehendi, styling</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer group">
              <CardContent className="p-4 md:p-5 text-center">
                <div className="text-3xl md:text-4xl mb-2">🎉</div>
                <h3 className="font-semibold text-sm md:text-base mb-1">Event Organizing</h3>
                <p className="text-xs text-muted-foreground">Parties, decoration</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4">
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/find-teammates')}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
                <CardTitle className="text-xs md:text-sm font-medium">Community</CardTitle>
                <Users className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold">{(usersData?.users.length || 0) + 1}</div>
              <p className="text-xs text-muted-foreground mt-1">Members</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/jobs')}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium">Jobs</CardTitle>
              <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold">{jobsData?.jobs?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/skill-swap')}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium">Mentors</CardTitle>
              <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold">{mentorsData?.matches?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Available</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/ideas')}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium">Ideas</CardTitle>
              <Lightbulb className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold">{ideasData?.ideas?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/events')}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium">Events</CardTitle>
              <CalendarDays className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/lost-found')}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium">Lost & Found</CardTitle>
              <Search className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold">{lostFoundData?.items?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Items</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/announcements')}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium">Announcements</CardTitle>
              <Megaphone className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold">{announcementsData?.announcements?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>
          </div>
        </div>

        {recentJobs.length > 0 && (
          <Card className="mb-6 md:mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Recent Jobs
                </CardTitle>
                <CardDescription className="text-xs md:text-sm mt-1">Latest opportunities in our community</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocation('/jobs')}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentJobs.map((job: any) => (
                  <div 
                    key={job.id} 
                    className="flex items-start justify-between gap-3 p-3 md:p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setLocation(`/jobs/${job.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base line-clamp-1">{job.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{job.company}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs">{job.experienceLevel}</Badge>
                        {job.requiredTechStack.slice(0, 2).map((tech: string) => (
                          <Badge key={tech} variant="outline" className="text-xs font-mono">{tech}</Badge>
                        ))}
                        {job.requiredTechStack.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{job.requiredTechStack.length - 2}</Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activityData?.activities && activityData.activities.length > 0 && (
          <Card className="mb-6 md:mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <ActivityIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs md:text-sm mt-1">What's happening in Nirala Estate</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocation('/activity-feed')}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityData.activities.map((activity: any) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 md:p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setLocation('/activity-feed')}
                  >
                    <Avatar className="w-8 h-8">
                      {activity.user?.profilePhotoUrl ? (
                        <AvatarImage src={activity.user.profilePhotoUrl} alt={activity.user.fullName} />
                      ) : (
                        <AvatarFallback>{getInitials(activity.user?.fullName || 'U')}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base line-clamp-2">{activity.content}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {latestIdeas.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Latest Ideas
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setLocation('/ideas')}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestIdeas.map((idea: any) => (
                    <div 
                      key={idea.id}
                      className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setLocation(`/ideas/${idea.id}`)}
                    >
                      <h4 className="font-semibold text-sm line-clamp-1">{idea.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{idea.interestCount} interested</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Upcoming Events
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setLocation('/events')}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event: any) => (
                    <div 
                      key={event.id}
                      className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setLocation(`/events/${event.id}`)}
                    >
                      <h4 className="font-semibold text-sm line-clamp-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.eventDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-2">{event.rsvpCount || 0} attending</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {recentForumPosts.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <MessagesSquare className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Recent Discussions
                </CardTitle>
                <CardDescription className="text-xs md:text-sm mt-1">Latest from the Tech Forum</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocation('/forum')}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentForumPosts.map((post: any) => (
                  <div 
                    key={post.id}
                    className="flex items-start gap-3 p-3 md:p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setLocation(`/forum/post/${post.id}`)}
                  >
                    <Avatar className="w-8 h-8 md:w-10 md:h-10">
                      <AvatarImage src={post.author?.profilePhotoUrl} />
                      <AvatarFallback className="text-xs bg-primary/10">
                        {getInitials(post.author?.fullName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {post.author?.fullName} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{post.replyCount || 0} replies</span>
                        <span>{post.viewCount || 0} views</span>
                        {post.category && (
                          <Badge variant="outline" className="text-xs">{post.category.name}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
