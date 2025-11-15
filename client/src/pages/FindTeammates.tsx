import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Users, 
  Briefcase, 
  ExternalLink, 
  MessageCircle, 
  ArrowLeft, 
  Sparkles, 
  Building2,
  Clock,
  Filter,
  UserPlus,
  UserMinus,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import PresenceIndicator from "@/components/PresenceIndicator";
import { SERVICE_CATEGORIES } from "../../../shared/serviceCategories";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  flatNumber: string;
  towerName?: string | null;
  company: string;
  techStack: string[];
  yearsOfExperience: number;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  profilePhotoUrl?: string | null;
  points: number;
  badges: string[];
  serviceCategories: string[];
  createdAt: Date;
}

const techOptions = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte",
  "Node.js", "Python", "Java", "PHP", "C#",
  "TypeScript", "JavaScript", "Go", "Rust",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "Machine Learning", "AI", "Data Science"
];

type FilterTab = 'all' | 'online' | 'skill' | 'interest' | 'tower' | 'new';

interface FindTeammatesProps {
  userId?: string;
  idToken?: string;
}

export default function FindTeammates({ userId, idToken }: FindTeammatesProps = {}) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const { openChat } = useChat();

  // Fetch current user data for tower filter
  const { data: currentUserData } = useQuery<{ user: User }>({
    queryKey: ['/api/users/me', userId],
    queryFn: async () => {
      if (!userId || !idToken) throw new Error('Not authenticated');
      const response = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
    enabled: !!userId && !!idToken,
  });

  // Fetch following list to show follow status
  const { data: followingData } = useQuery<{ users: Array<{ id: string; fullName: string; followedAt: string }> }>({
    queryKey: [`/api/users/${userId}/following`],
    queryFn: async () => {
      if (!userId || !idToken) throw new Error('Not authenticated');
      const response = await fetch(`/api/users/${userId}/following`, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch following');
      return response.json();
    },
    enabled: !!userId && !!idToken,
  });

  const followingIds = new Set((followingData?.users || []).map(u => u.id));

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('excludeUserId', userId);
    }
    
    // Apply filters based on active tab
    switch (activeTab) {
      case 'online':
        params.append('onlineOnly', 'true');
        break;
      
      case 'skill':
        if (selectedTech.length > 0) {
          selectedTech.forEach(tech => params.append('techStack', tech));
        }
        if (experienceRange === '0-2') {
          params.append('minExperience', '0');
          params.append('maxExperience', '2');
        } else if (experienceRange === '3-5') {
          params.append('minExperience', '3');
          params.append('maxExperience', '5');
        } else if (experienceRange === '5+') {
          params.append('minExperience', '5');
        }
        break;
      
      case 'interest':
        if (selectedInterests.length > 0) {
          selectedInterests.forEach(interest => params.append('interestIds', interest));
        }
        break;
      
      case 'tower':
        if (currentUserData?.user?.towerName) {
          params.append('sameTower', currentUserData.user.towerName);
        }
        break;
      
      case 'new':
        params.append('newMembers', 'true');
        break;
    }
    
    return params.toString();
  };

  const { data, isLoading, refetch } = useQuery<{ users: User[] }>({
    queryKey: ['/api/users/search', activeTab, userId, selectedTech, selectedInterests, experienceRange, currentUserData?.user?.towerName],
    queryFn: async () => {
      const queryString = buildQueryString();
      const url = queryString ? `/api/users/search?${queryString}` : '/api/users/search';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    // Wait for current user data when tower filter is active
    enabled: activeTab !== 'tower' || !!currentUserData?.user,
  });

  const toggleTech = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const toggleInterest = (categoryId: string) => {
    setSelectedInterests(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedTech([]);
    setSelectedInterests([]);
    setExperienceRange("all");
    setShowFilters(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleConnect = (user: User) => {
    const message = encodeURIComponent(`Hi ${user.fullName}! I found your profile on Nirala Techie and would like to connect.`);
    const whatsappUrl = `https://wa.me/${user.phoneNumber?.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ targetUserId, targetUserName, isFollowing }: { targetUserId: string; targetUserName: string; isFollowing: boolean }) => {
      if (!idToken) {
        throw new Error('Authentication required');
      }
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update follow status');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate following list to update follow status
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/following`] });
      // Invalidate search results to refresh follow buttons
      queryClient.invalidateQueries({ 
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === '/api/users/search'
      });
      toast({
        title: variables.isFollowing ? "Unfollowed" : "Following",
        description: variables.isFollowing 
          ? `You are no longer following ${variables.targetUserName}`
          : `You are now following ${variables.targetUserName}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to update follow status',
      });
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async (user: User) => {
      if (!idToken) {
        throw new Error('Please log in to start a chat');
      }
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId: user.id }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return { ...await response.json(), user };
    },
    onSuccess: (data) => {
      const conversationId = data.conversation.id;
      const user = data.user;
      
      openChat(conversationId, {
        id: user.id,
        fullName: user.fullName,
        profilePhotoUrl: user.profilePhotoUrl,
        company: user.company,
        flatNumber: user.flatNumber,
      });
      
      toast({
        title: "Chat opened!",
        description: `Now chatting with ${user.fullName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start chat",
        variant: "destructive",
      });
    },
  });

  const handleStartChat = (user: User) => {
    startChatMutation.mutate(user);
  };

  const getTabLabel = (tab: FilterTab) => {
    switch (tab) {
      case 'all': return 'All Members';
      case 'online': return 'Online Now';
      case 'skill': return 'By Skill';
      case 'interest': return 'By Interest';
      case 'tower': return 'Same Tower';
      case 'new': return 'New Members';
    }
  };

  const getTabIcon = (tab: FilterTab) => {
    switch (tab) {
      case 'all': return <Users className="w-3.5 h-3.5" />;
      case 'online': return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case 'skill': return <Briefcase className="w-3.5 h-3.5" />;
      case 'interest': return <Sparkles className="w-3.5 h-3.5" />;
      case 'tower': return <Building2 className="w-3.5 h-3.5" />;
      case 'new': return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const hasActiveFilters = () => {
    if (activeTab === 'skill') {
      return selectedTech.length > 0 || experienceRange !== 'all';
    }
    if (activeTab === 'interest') {
      return selectedInterests.length > 0;
    }
    return false;
  };

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedUser(null)}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedUser.profilePhotoUrl || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(selectedUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-1 right-1">
                    <PresenceIndicator userId={selectedUser.id} idToken={idToken} size="lg" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{selectedUser.fullName}</CardTitle>
                    <Badge variant="secondary">{selectedUser.flatNumber}</Badge>
                    {selectedUser.towerName && (
                      <Badge variant="outline">{selectedUser.towerName}</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {selectedUser.company} • {selectedUser.yearsOfExperience} years experience
                  </p>
                  <PresenceIndicator userId={selectedUser.id} idToken={idToken} showLastSeen className="mb-3" />
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedUser.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="font-mono text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userId && idToken && userId !== selectedUser.id && (
                      <>
                        <Button
                          variant={followingIds.has(selectedUser.id) ? "outline" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            followMutation.mutate({ 
                              targetUserId: selectedUser.id, 
                              targetUserName: selectedUser.fullName,
                              isFollowing: followingIds.has(selectedUser.id)
                            });
                          }}
                          disabled={!idToken || followMutation.isPending}
                          data-testid={`button-follow-${selectedUser.id}`}
                        >
                          {followMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : followingIds.has(selectedUser.id) ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleStartChat(selectedUser)}
                          disabled={startChatMutation.isPending}
                          data-testid="button-start-chat"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {startChatMutation.isPending ? 'Starting...' : 'Start Chat'}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleConnect(selectedUser)}
                      data-testid="button-connect"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect on WhatsApp
                    </Button>
                    {selectedUser.linkedinUrl && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedUser.linkedinUrl!, '_blank')}
                        data-testid="button-linkedin-profile"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.badges.map((badge) => (
                      <Badge key={badge} variant="secondary">
                        🏆 {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community Points</h3>
                  <p className="text-2xl font-bold text-primary">{selectedUser.points} points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold">Find Teammates</h1>
            </div>
            <Link href="/dashboard" className="hidden md:block">
              <Button variant="outline" data-testid="button-dashboard">
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            Connect with IT professionals in your community
          </p>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20">
            {(['all', 'online', 'skill', 'interest', 'tower', 'new'] as FilterTab[]).map((tab) => {
              return (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab !== 'skill' && tab !== 'interest') {
                      setShowFilters(false);
                    }
                  }}
                  className="whitespace-nowrap"
                  data-testid={`tab-${tab}`}
                >
                  <span className="mr-1.5">{getTabIcon(tab)}</span>
                  {getTabLabel(tab)}
                  {activeTab === tab && hasActiveFilters() && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeTab === 'skill' ? selectedTech.length : selectedInterests.length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {(activeTab === 'skill' || activeTab === 'interest') && (
        <div className="border-b bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="mb-3"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
              {hasActiveFilters() && (
                <Badge variant="default" className="ml-2">
                  {activeTab === 'skill' 
                    ? selectedTech.length + (experienceRange !== 'all' ? 1 : 0)
                    : selectedInterests.length}
                </Badge>
              )}
            </Button>

            <Collapsible open={showFilters}>
              <CollapsibleContent>
                {activeTab === 'skill' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-3 block font-semibold">Tech Stack</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                        {techOptions.map((tech) => (
                          <div key={tech} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tech-${tech}`}
                              checked={selectedTech.includes(tech)}
                              onCheckedChange={() => toggleTech(tech)}
                              data-testid={`checkbox-tech-${tech.toLowerCase().replace(/[.\s]/g, '-')}`}
                            />
                            <Label
                              htmlFor={`tech-${tech}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {tech}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experience" className="mb-3 block font-semibold">
                        Years of Experience
                      </Label>
                      <Select value={experienceRange} onValueChange={setExperienceRange}>
                        <SelectTrigger id="experience" data-testid="select-experience">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Experience Levels</SelectItem>
                          <SelectItem value="0-2">0-2 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                      </Select>

                      {hasActiveFilters() && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4"
                          onClick={clearFilters}
                          data-testid="button-clear-filters"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'interest' && (
                  <div>
                    <Label className="mb-3 block font-semibold">Service Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {SERVICE_CATEGORIES.map((category) => (
                        <div
                          key={category.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedInterests.includes(category.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => toggleInterest(category.id)}
                          data-testid={`interest-${category.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{category.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{category.name}</h4>
                            </div>
                            {selectedInterests.includes(category.id) && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasActiveFilters() && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={clearFilters}
                        data-testid="button-clear-filters"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        ) : data?.users && data.users.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {data.users.length} {data.users.length === 1 ? 'member' : 'members'}
            </p>
            {data.users.map((user) => {
              const isFollowing = followingIds.has(user.id);
              const isOwnProfile = userId === user.id;
              
              return (
                <Link key={user.id} href={`/profile/${user.id}`}>
                  <Card
                    className="hover-elevate cursor-pointer"
                    data-testid={`card-member-${user.id}`}
                  >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex gap-3 md:gap-4">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-14 h-14 md:w-16 md:h-16">
                          <AvatarImage src={user.profilePhotoUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm md:text-base">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0">
                          <PresenceIndicator userId={user.id} idToken={idToken} size="md" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base md:text-lg" data-testid={`text-name-${user.id}`}>
                            {user.fullName}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {user.flatNumber}
                          </Badge>
                          {user.towerName && (
                            <Badge variant="outline" className="text-xs">
                              {user.towerName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{user.company}</span>
                          <span>•</span>
                          <span>{user.yearsOfExperience} years</span>
                        </div>
                        <PresenceIndicator userId={user.id} idToken={idToken} showLastSeen className="mb-2" />
                        <div className="flex flex-wrap gap-1">
                          {user.techStack.slice(0, 4).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs font-mono">
                              {tech}
                            </Badge>
                          ))}
                          {user.techStack.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.techStack.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!isOwnProfile && idToken && userId && (
                        <div className="flex-shrink-0">
                          <Button
                            variant={isFollowing ? "outline" : "default"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              followMutation.mutate({ 
                                targetUserId: user.id, 
                                targetUserName: user.fullName,
                                isFollowing 
                              });
                            }}
                            disabled={!idToken || followMutation.isPending}
                            className="gap-2"
                            data-testid={`button-follow-${user.id}`}
                          >
                            {followMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isFollowing ? (
                              <>
                                <UserMinus className="w-3 h-3" />
                                <span className="hidden md:inline">Unfollow</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span className="hidden md:inline">Follow</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === 'tower' && !currentUserData?.user?.towerName
                ? 'No tower information'
                : 'No members found'}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'tower' && !currentUserData?.user?.towerName
                ? 'Update your profile with tower information to find neighbors'
                : activeTab === 'skill' || activeTab === 'interest'
                ? 'Try adjusting your filters to find more teammates'
                : 'No teammates match this filter'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
