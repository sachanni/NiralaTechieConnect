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
import { Search, Users, Briefcase, Home, ExternalLink, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import PresenceIndicator from "@/components/PresenceIndicator";

interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  flatNumber: string;
  company: string;
  techStack: string[];
  yearsOfExperience: number;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  profilePhotoUrl?: string | null;
  points: number;
  badges: string[];
}

const techOptions = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte",
  "Node.js", "Python", "Java", "PHP", "C#",
  "TypeScript", "JavaScript", "Go", "Rust",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "Machine Learning", "AI", "Data Science"
];

interface FindTeammatesProps {
  userId?: string;
  idToken?: string;
}

export default function FindTeammates({ userId, idToken }: FindTeammatesProps = {}) {
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState<string>("all");
  const [flatBlock, setFlatBlock] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { openChat } = useChat();

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('excludeUserId', userId);
    }
    
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
    
    if (flatBlock) {
      params.append('flatBlock', flatBlock);
    }
    
    return params.toString();
  };

  const { data, isLoading, refetch } = useQuery<{ users: User[] }>({
    queryKey: ['/api/users/search', userId, selectedTech, experienceRange, flatBlock],
    queryFn: async () => {
      const queryString = buildQueryString();
      const url = queryString ? `/api/users/search?${queryString}` : '/api/users/search';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Fetch online users for "Online Now" section
  const { data: onlineUsers } = useQuery<{ users: User[] }>({
    queryKey: ['/api/presence/online', userId],
    queryFn: async () => {
      const excludeParam = userId ? `?excludeUserId=${userId}` : '';
      const response = await fetch(`/api/presence/online${excludeParam}`);
      if (!response.ok) throw new Error('Failed to fetch online users');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const toggleTech = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const clearFilters = () => {
    setSelectedTech([]);
    setExperienceRange("all");
    setFlatBlock("");
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
      
      // Open chat popup instead of redirecting
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
                      <Button
                        onClick={() => handleStartChat(selectedUser)}
                        disabled={startChatMutation.isPending}
                        data-testid="button-start-chat"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {startChatMutation.isPending ? 'Starting...' : 'Start Chat'}
                      </Button>
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
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Find Teammates</h1>
            </div>
            <Link href="/dashboard" className="hidden md:block">
              <Button variant="outline" data-testid="button-dashboard">
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Connect with IT professionals in your community
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Tech Stack</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
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
                <Label htmlFor="experience" className="mb-3 block">
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
              </div>

              <div>
                <Label htmlFor="flatBlock" className="mb-3 block">
                  <Home className="w-4 h-4 inline mr-1" />
                  Flat Block
                </Label>
                <Input
                  id="flatBlock"
                  placeholder="e.g., T27, T17"
                  value={flatBlock}
                  onChange={(e) => setFlatBlock(e.target.value)}
                  data-testid="input-flat-block"
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          <div>
            {/* Online Now Section */}
            {onlineUsers && onlineUsers.users.length > 0 && (
              <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Online Now
                    <Badge variant="secondary" className="ml-auto">
                      {onlineUsers.users.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-green-200 dark:scrollbar-thumb-green-800">
                    {onlineUsers.users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="flex-shrink-0 cursor-pointer group"
                      >
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-background/50 transition-colors">
                          <div className="relative">
                            <Avatar className="w-14 h-14 border-2 border-green-500">
                              <AvatarImage src={user.profilePhotoUrl || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {getInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1">
                              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-background"></div>
                            </div>
                          </div>
                          <div className="text-center max-w-[80px]">
                            <p className="text-xs font-medium truncate">{user.fullName.split(' ')[0]}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{user.flatNumber}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                {data.users.map((user) => (
                  <Card
                    key={user.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                    data-testid={`card-member-${user.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={user.profilePhotoUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0">
                            <PresenceIndicator userId={user.id} idToken={idToken} size="md" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg" data-testid={`text-name-${user.id}`}>
                              {user.fullName}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {user.flatNumber}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{user.company}</span>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No members found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to find more teammates
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
