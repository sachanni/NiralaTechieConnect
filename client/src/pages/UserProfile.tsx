import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Briefcase,
  ExternalLink,
  MessageCircle,
  UserPlus,
  UserMinus,
  Loader2,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import PresenceIndicator from "@/components/PresenceIndicator";
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

interface UserProfileProps {
  userId?: string;
  idToken?: string;
}

export default function UserProfile({ userId: currentUserId, idToken }: UserProfileProps = {}) {
  const params = useParams();
  const profileUserId = params.userId;
  const { toast } = useToast();
  const { openChat } = useChat();

  // Fetch user profile data
  const { data: profileData, isLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/users', profileUserId],
    queryFn: async () => {
      if (!profileUserId) throw new Error('No user ID provided');
      const response = await fetch(`/api/users/${profileUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      return response.json();
    },
    enabled: !!profileUserId,
  });

  // Fetch following list to show follow status
  const { data: followingData } = useQuery<{ users: Array<{ id: string; fullName: string; followedAt: string }> }>({
    queryKey: [`/api/users/${currentUserId}/following`],
    queryFn: async () => {
      if (!currentUserId || !idToken) throw new Error('Not authenticated');
      const response = await fetch(`/api/users/${currentUserId}/following`, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch following');
      return response.json();
    },
    enabled: !!currentUserId && !!idToken,
  });

  const followingIds = new Set((followingData?.users || []).map(u => u.id));
  const isFollowing = profileUserId ? followingIds.has(profileUserId) : false;
  const isOwnProfile = currentUserId === profileUserId;

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
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}/following`] });
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

  const handleConnect = (user: User) => {
    const message = encodeURIComponent(`Hi ${user.fullName}! I found your profile on Nirala Techie and would like to connect.`);
    const whatsappUrl = `https://wa.me/${user.phoneNumber?.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData?.user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/find-teammates">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Find Teammates
            </Button>
          </Link>
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">User not found</h3>
            <p className="text-muted-foreground">This user profile does not exist.</p>
          </Card>
        </div>
      </div>
    );
  }

  const user = profileData.user;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/find-teammates">
          <Button 
            variant="ghost" 
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Find Teammates
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.profilePhotoUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1">
                  <PresenceIndicator userId={user.id} idToken={idToken} size="lg" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                  <Badge variant="secondary">{user.flatNumber}</Badge>
                  {user.towerName && (
                    <Badge variant="outline">{user.towerName}</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">
                  {user.company} • {user.yearsOfExperience} years experience
                </p>
                <PresenceIndicator userId={user.id} idToken={idToken} showLastSeen className="mb-3" />
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="font-mono text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isOwnProfile && currentUserId && idToken && (
                    <>
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        onClick={() => {
                          followMutation.mutate({ 
                            targetUserId: user.id, 
                            targetUserName: user.fullName,
                            isFollowing
                          });
                        }}
                        disabled={!idToken || followMutation.isPending}
                        data-testid={`button-follow-${user.id}`}
                      >
                        {followMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : isFollowing ? (
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
                        onClick={() => handleStartChat(user)}
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
                    onClick={() => handleConnect(user)}
                    data-testid="button-connect"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect on WhatsApp
                  </Button>
                  {user.linkedinUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(user.linkedinUrl!, '_blank')}
                      data-testid="button-linkedin-profile"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  )}
                  {user.githubUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(user.githubUrl!, '_blank')}
                      data-testid="button-github-profile"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {user.badges && user.badges.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge) => (
                      <Badge key={badge} variant="secondary">
                        🏆 {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Community Points</h3>
                <p className="text-2xl font-bold text-primary">{user.points} points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
