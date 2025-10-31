import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import BadgeDisplay from "@/components/BadgeDisplay";
import { Trophy, Star, Users, Edit, ExternalLink, MessageCircle, Briefcase, Lightbulb, GraduationCap, CalendarDays, MessagesSquare, User, Building, MapPin, Home, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import EditSkillsModal from "@/components/EditSkillsModal";
import EditProfileModal from "@/components/EditProfileModal";

interface ProfileProps {
  user: {
    fullName: string;
    company: string;
    flatNumber: string;
    email: string;
    phoneNumber: string;
    techStack: string[];
    yearsOfExperience: number;
    linkedinUrl?: string;
    githubUrl?: string;
    profilePhotoUrl?: string;
    points: number;
    badges: string[];
    skillsToTeach?: string[];
    skillsToLearn?: string[];
    companyHistory?: string[];
    specialties?: string[];
    showEmail?: number;
    showPhone?: number;
  };
  userId: string;
  idToken: string;
}

export default function Profile({ user: initialUser, userId, idToken }: ProfileProps) {
  const [, setLocation] = useLocation();
  const [isEditSkillsModalOpen, setIsEditSkillsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const { data: freshUserData } = useQuery<typeof initialUser>({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
    initialData: initialUser,
    refetchInterval: false,
    staleTime: 0,
  });

  const user = freshUserData || initialUser;
  
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const response = await fetch('/api/messages/unread/count', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch unread count');
      return response.json();
    },
    refetchInterval: 5000,
  });

  const { data: jobCountData } = useQuery<{ postedJobs: number, appliedJobs: number }>({
    queryKey: ['myJobsCount'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/my-stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) return { postedJobs: 0, appliedJobs: 0 };
      return response.json();
    },
  });

  const { data: ideasData } = useQuery<{ postedIdeas: number, interestedIdeas: number }>({
    queryKey: ['myIdeasCount'],
    queryFn: async () => {
      const response = await fetch('/api/ideas/my-stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) return { postedIdeas: 0, interestedIdeas: 0 };
      return response.json();
    },
  });

  const { data: usersData } = useQuery<{ users: any[] }>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/search?excludeUserId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: eventsData } = useQuery<{ rsvps: any[] }>({
    queryKey: ['my-events-rsvps'],
    queryFn: async () => {
      const response = await fetch('/api/events/my-rsvps', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    enabled: !!idToken,
  });

  const { data: forumCountData } = useQuery<{ myPosts: number, myAnswers: number }>({
    queryKey: ['myForumCount'],
    queryFn: async () => {
      const response = await fetch('/api/forum/my-stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) return { myPosts: 0, myAnswers: 0 };
      return response.json();
    },
  });

  const getInitials = () => {
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const nextLevelPoints = 100;
  const progressToNextLevel = (user.points / nextLevelPoints) * 100;

  const totalJobs = (jobCountData?.postedJobs || 0) + (jobCountData?.appliedJobs || 0);
  const totalIdeas = (ideasData?.postedIdeas || 0) + (ideasData?.interestedIdeas || 0);
  const totalForumActivity = (forumCountData?.myPosts || 0) + (forumCountData?.myAnswers || 0);
  const myUpcomingEventsCount = eventsData?.rsvps?.filter((r: any) => {
    try {
      return new Date(r.event.eventDate) >= new Date();
    } catch {
      return false;
    }
  }).length || 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h1 className="text-lg md:text-2xl font-bold text-foreground">My Profile</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="hidden md:flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-card-border">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 md:border-4 border-background">
                <AvatarImage src={user.profilePhotoUrl} />
                <AvatarFallback className="text-xl md:text-2xl bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">{user.fullName}</h2>
                  <Badge variant="secondary" className="h-5 md:h-6 text-xs md:text-sm">
                    {user.flatNumber}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground mb-2 md:mb-3">
                  <Building className="w-4 h-4" />
                  <span>{user.company}</span>
                  <span>•</span>
                  <span>{user.yearsOfExperience} yrs experience</span>
                </div>
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                  {user.techStack.slice(0, 5).map((tech) => (
                    <Badge key={tech} variant="outline" className="font-mono text-xs h-5 md:h-6">
                      {tech}
                    </Badge>
                  ))}
                  {user.techStack.length > 5 && (
                    <Badge variant="outline" className="h-5 md:h-6 text-xs">
                      +{user.techStack.length - 5}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {user.showEmail === 1 && user.email && (
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                      <Mail className="w-3 h-3 md:w-4 md:h-4" />
                      <a href={`mailto:${user.email}`} className="hover:text-primary transition-colors">
                        {user.email}
                      </a>
                    </div>
                  )}
                  {user.showPhone === 1 && user.phoneNumber && (
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                      <Phone className="w-3 h-3 md:w-4 md:h-4" />
                      <a href={`tel:${user.phoneNumber}`} className="hover:text-primary transition-colors">
                        {user.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.linkedinUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(user.linkedinUrl, '_blank')}
                      className="h-8 md:h-9"
                    >
                      <ExternalLink className="w-3 h-3 mr-1.5" />
                      LinkedIn
                    </Button>
                  )}
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="h-8 md:h-9"
                  >
                    <Edit className="w-3 h-3 mr-1.5" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-1 md:gap-2 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium truncate">Points</CardTitle>
              <Star className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {user.points}
              </div>
              <div className="mt-2 hidden md:block">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Level Progress</span>
                  <span>{user.points}/{nextLevelPoints}</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-1 md:gap-2 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium truncate">Badges</CardTitle>
              <Trophy className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {user.badges.length}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={() => setLocation('/chat')}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-1 md:gap-2 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium truncate">Messages</CardTitle>
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {unreadData?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {unreadData?.count === 0 ? 'No new' : `${unreadData?.count} new`}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={() => setLocation('/find-teammates')}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-1 md:gap-2 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium truncate">Teammates</CardTitle>
              <Users className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {usersData?.users.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                IT professionals
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={() => setLocation('/my-jobs')}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-1 md:gap-2 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium truncate">Jobs</CardTitle>
              <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {totalJobs}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {jobCountData?.postedJobs || 0} posted • {jobCountData?.appliedJobs || 0} applied
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={() => setLocation('/my-ideas')}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-1 md:gap-2 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium truncate">Ideas</CardTitle>
              <Lightbulb className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {totalIdeas}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {ideasData?.postedIdeas || 0} idea{(ideasData?.postedIdeas || 0) !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={() => setLocation('/forum')}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-1 md:gap-2 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium truncate">Forum</CardTitle>
              <MessagesSquare className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {totalForumActivity}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {forumCountData?.myPosts || 0} posts • {forumCountData?.myAnswers || 0} answers
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer col-span-2 md:col-span-3" 
            onClick={() => setLocation('/my-events')}
          >
            <CardHeader className="flex flex-row items-center justify-between gap-1 md:gap-2 space-y-0 pb-1 md:pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium truncate">My Events</CardTitle>
              <CalendarDays className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {myUpcomingEventsCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {myUpcomingEventsCount === 0 
                  ? 'No upcoming events' 
                  : `${myUpcomingEventsCount} upcoming event${myUpcomingEventsCount > 1 ? 's' : ''}`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {user.badges && user.badges.length > 0 && (
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                My Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BadgeDisplay badges={user.badges} userId={userId} idToken={idToken} />
            </CardContent>
          </Card>
        )}

        {(user.skillsToTeach && user.skillsToTeach.length > 0) || (user.skillsToLearn && user.skillsToLearn.length > 0) ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Skills Exchange
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditSkillsModalOpen(true)}
                >
                  <Edit className="w-3 h-3 mr-1.5" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.skillsToTeach && user.skillsToTeach.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-green-600">Can Teach</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsToTeach.map((skill) => (
                      <Badge key={skill} className="bg-green-100 text-green-700 border-green-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {user.skillsToLearn && user.skillsToLearn.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-blue-600">Want to Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsToLearn.map((skill) => (
                      <Badge key={skill} className="bg-blue-100 text-blue-700 border-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(!user.skillsToTeach || user.skillsToTeach.length === 0) && (!user.skillsToLearn || user.skillsToLearn.length === 0) && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">No skills added yet</p>
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditSkillsModalOpen(true)}
                  >
                    Add Skills
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Skills Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">Share your skills and learn from others</p>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditSkillsModalOpen(true)}
                >
                  <Edit className="w-3 h-3 mr-1.5" />
                  Add Skills
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <EditSkillsModal
        isOpen={isEditSkillsModalOpen}
        onClose={() => setIsEditSkillsModalOpen(false)}
        userId={userId}
        idToken={idToken}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={user}
        idToken={idToken}
      />
    </div>
  );
}
