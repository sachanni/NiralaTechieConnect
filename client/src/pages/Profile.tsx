import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import BadgeDisplay from "@/components/BadgeDisplay";
import { 
  Trophy, Star, Users, Edit, ExternalLink, MessageCircle, Briefcase, 
  Lightbulb, CalendarDays, MessagesSquare, Building, MapPin, Mail, 
  Phone, Github, Linkedin, TrendingUp, Award, Sparkles, ChevronRight, Settings
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import EditSkillsModal from "@/components/EditSkillsModal";
import EditProfileModal from "@/components/EditProfileModal";
import { SERVICE_CATEGORIES } from "../../../shared/serviceCategories";

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

  const { data: servicesData } = useQuery<{ services: any[] }>({
    queryKey: ['user-services', userId],
    queryFn: async () => {
      const response = await fetch('/api/users/services', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) return { services: [] };
      return response.json();
    },
    enabled: !!idToken,
  });

  // Count unique services (not total records, since one service can have both provider and seeker roles)
  const servicesCount = servicesData?.services 
    ? new Set(servicesData.services.map((s: any) => s.serviceId)).size 
    : 0;

  const getInitials = () => {
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  const totalCommunityMembers = (usersData?.users?.length || 0) + 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="relative">
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="relative -mt-12 md:-mt-20">
            <Card className="shadow-lg">
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-24 h-24 md:w-40 md:h-40 border-[5px] md:border-[6px] border-white shadow-2xl ring-2 ring-gray-100">
                      <AvatarImage src={user.profilePhotoUrl} className="object-cover" />
                      <AvatarFallback className="text-2xl md:text-5xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                          {user.fullName}
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground mb-2">
                          {user.company} • {user.yearsOfExperience} years experience
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>Nirala Estate, Flat {user.flatNumber}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-primary font-medium">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{totalCommunityMembers} members</span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{user.points} points</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="default"
                          onClick={() => setLocation('/profile/edit')}
                          data-testid="button-edit-profile"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setLocation('/dashboard')}
                        >
                          Dashboard
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setLocation('/my-services')}
                          className="relative"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Services
                          <Badge variant="secondary" className="ml-2">
                            {servicesCount}
                          </Badge>
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {user.showEmail === 1 && user.email && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`mailto:${user.email}`} className="text-muted-foreground hover:text-primary">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="text-xs">{user.email}</span>
                          </a>
                        </Button>
                      )}
                      {user.showPhone === 1 && user.phoneNumber && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`tel:${user.phoneNumber}`} className="text-muted-foreground hover:text-primary">
                            <Phone className="w-4 h-4 mr-2" />
                            <span className="text-xs">{user.phoneNumber}</span>
                          </a>
                        </Button>
                      )}
                      {user.linkedinUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-600">
                            <Linkedin className="w-4 h-4 mr-2" />
                            <span className="text-xs">LinkedIn</span>
                          </a>
                        </Button>
                      )}
                      {user.githubUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gray-900">
                            <Github className="w-4 h-4 mr-2" />
                            <span className="text-xs">GitHub</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="text-3xl font-bold text-blue-600">{user.points}</div>
                <div className="text-sm text-muted-foreground mt-1">Points</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100">
                <div className="text-3xl font-bold text-purple-600">{user.badges.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Badges</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="text-3xl font-bold text-green-600">{totalCommunityMembers}</div>
                <div className="text-sm text-muted-foreground mt-1">Members</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-100">
                <div className="text-3xl font-bold text-orange-600">{unreadData?.count || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Skills & Expertise
            </CardTitle>
            <CardDescription>Your technical stack and areas of expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {user.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-mono">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {user.specialties && user.specialties.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {((user.skillsToTeach && user.skillsToTeach.length > 0) || (user.skillsToLearn && user.skillsToLearn.length > 0)) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Skills Exchange
                  </CardTitle>
                  <CardDescription>Skills you can teach and want to learn</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditSkillsModalOpen(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Skills
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {user.skillsToTeach && user.skillsToTeach.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <span className="text-green-600">Can Teach</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {user.skillsToTeach.map((skill) => (
                        <Badge key={skill} className="bg-green-100 text-green-700 hover:bg-green-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.skillsToLearn && user.skillsToLearn.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <span className="text-blue-600">Want to Learn</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {user.skillsToLearn.map((skill) => (
                        <Badge key={skill} className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {servicesCount > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    My Services
                  </CardTitle>
                  <CardDescription>Services you offer and seek in the community</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation('/my-services')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Manage Services
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const providerServices = servicesData?.services?.filter(s => s.roleType === 'provider') || [];
                const seekerServices = servicesData?.services?.filter(s => s.roleType === 'seeker') || [];
                const hasProviders = providerServices.length > 0;
                const hasSeekers = seekerServices.length > 0;

                return (
                  <div className={`grid ${hasProviders && hasSeekers ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                    {hasProviders && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <span className="text-green-600">I Offer</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {providerServices.map((service) => {
                            const category = SERVICE_CATEGORIES.find(c => c.id === service.categoryId);
                            const serviceInfo = category?.services.find(s => s.id === service.serviceId);
                            return serviceInfo ? (
                              <Badge key={`${service.serviceId}-provider`} className="bg-green-100 text-green-700 hover:bg-green-200">
                                {serviceInfo.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {hasSeekers && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <span className="text-blue-600">I Need</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {seekerServices.map((service) => {
                            const category = SERVICE_CATEGORIES.find(c => c.id === service.categoryId);
                            const serviceInfo = category?.services.find(s => s.id === service.serviceId);
                            return serviceInfo ? (
                              <Badge key={`${service.serviceId}-seeker`} className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                {serviceInfo.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Activity & Contributions
            </CardTitle>
            <CardDescription>Your engagement across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                onClick={() => setLocation('/jobs')}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Jobs</div>
                    <div className="text-sm text-muted-foreground">
                      {jobCountData?.postedJobs || 0} posted • {jobCountData?.appliedJobs || 0} applied
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                onClick={() => setLocation('/ideas')}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Ideas</div>
                    <div className="text-sm text-muted-foreground">
                      {ideasData?.postedIdeas || 0} posted • {ideasData?.interestedIdeas || 0} interested
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                onClick={() => setLocation('/forum')}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessagesSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Forum</div>
                    <div className="text-sm text-muted-foreground">
                      {forumCountData?.myPosts || 0} posts • {forumCountData?.myAnswers || 0} answers
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button 
                onClick={() => setLocation('/events')}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Events</div>
                    <div className="text-sm text-muted-foreground">
                      {myUpcomingEventsCount} upcoming
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>

        {user.badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievements & Badges
              </CardTitle>
              <CardDescription>Your earned badges and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeDisplay badges={user.badges} size="lg" />
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
        userId={userId}
        idToken={idToken}
      />
    </div>
  );
}
