import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, ArrowLeft, Users, DollarSign, Building, MapPin, MessageCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { UpvoteButton } from "@/components/UpvoteButton";
import { CommentSection } from "@/components/CommentSection";
import { ShareButton } from "@/components/ShareButton";
import { JoinTeamModal } from "@/components/JoinTeamModal";
import { useChat } from "@/contexts/ChatContext";

interface User {
  id: string;
  fullName: string;
  company: string;
  profilePhotoUrl?: string | null;
  flatNumber: string;
  phoneNumber: string;
}

interface Idea {
  id: string;
  posterId: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  payStructure: string;
  status: string;
  interestCount: number;
  upvoteCount: number;
  commentCount: number;
  createdAt: string;
  poster: User;
}

interface TeamMember {
  id: string;
  applicantId: string;
  roleAppliedFor: string;
  status: string;
  createdAt: string;
  applicant: User;
}

interface IdeaDetailsProps {
  userId?: string;
  idToken?: string;
}

export default function IdeaDetails({ userId, idToken }: IdeaDetailsProps = {}) {
  const [, params] = useRoute("/ideas/:id");
  const ideaId = params?.id;
  const [isExpressInterestOpen, setIsExpressInterestOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { openChat } = useChat();

  const { data: ideaData, isLoading: ideaLoading } = useQuery<{ idea: Idea }>({
    queryKey: [`/api/ideas/${ideaId}`],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch idea');
      return response.json();
    },
    enabled: !!ideaId && !!idToken,
  });

  const { data: interestData } = useQuery<{ hasExpressed: boolean }>({
    queryKey: [`/api/ideas/${ideaId}/has-expressed-interest`],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/has-expressed-interest`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { hasExpressed: false };
      return response.json();
    },
    enabled: !!ideaId && !!idToken && !!userId,
  });

  const { data: teamRosterData } = useQuery<{ teamMembers: TeamMember[] }>({
    queryKey: [`/api/ideas/${ideaId}/team-roster`],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/team-roster`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { teamMembers: [] };
      return response.json();
    },
    enabled: !!ideaId && !!idToken,
  });

  const expressInterestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/express-interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ message: message.trim() || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to express interest');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interest Expressed!",
        description: "The idea poster will be able to see your interest and contact you.",
      });
      setIsExpressInterestOpen(false);
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/has-expressed-interest`] });
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to express interest",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'Frontend Dev': 'bg-blue-100 text-blue-700',
      'Backend Dev': 'bg-green-100 text-green-700',
      'Full Stack Dev': 'bg-purple-100 text-purple-700',
      'ML Engineer': 'bg-pink-100 text-pink-700',
      'Designer': 'bg-orange-100 text-orange-700',
      'Product Manager': 'bg-yellow-100 text-yellow-700',
      'Business Dev': 'bg-teal-100 text-teal-700',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-700';
  };

  const handleExpressInterest = () => {
    if (!userId || !idToken) {
      toast({
        title: "Authentication Required",
        description: "Please log in to express interest",
        variant: "destructive",
      });
      return;
    }
    expressInterestMutation.mutate();
  };

  const startChatMutation = useMutation({
    mutationFn: async (poster: User) => {
      if (!idToken) {
        throw new Error('Please log in to start a chat');
      }
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId: poster.id }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return { ...await response.json(), poster };
    },
    onSuccess: (data) => {
      const conversationId = data.conversation.id;
      const poster = data.poster;
      
      openChat(conversationId, {
        id: poster.id,
        fullName: poster.fullName,
        profilePhotoUrl: poster.profilePhotoUrl,
        company: poster.company,
        flatNumber: poster.flatNumber,
      });
      
      toast({
        title: "Chat opened!",
        description: `Now chatting with ${poster.fullName}`,
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

  const handleChatPoster = () => {
    if (!idea?.poster) return;
    startChatMutation.mutate(idea.poster);
  };

  if (ideaLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (!ideaData?.idea) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Idea Not Found</h3>
          <p className="text-muted-foreground mb-4">This idea may have been removed or doesn't exist.</p>
          <Link href="/ideas">
            <Button>Back to Idea Wall</Button>
          </Link>
        </div>
      </div>
    );
  }

  const idea = ideaData.idea;
  const hasExpressed = interestData?.hasExpressed || false;
  const isOwnIdea = idea.posterId === userId;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/ideas">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Idea Wall
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Idea Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-2xl flex-1">{idea.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <UpvoteButton ideaId={idea.id} initialUpvoteCount={idea.upvoteCount} idToken={idToken} variant="compact" />
                    <ShareButton ideaId={idea.id} title={idea.title} description={idea.description} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Description
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Roles Needed
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {idea.rolesNeeded.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className={`text-sm ${getRoleBadgeColor(role)}`}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Equity / Pay Structure
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-900 font-medium">{idea.payStructure}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{idea.interestCount} {idea.interestCount === 1 ? 'person has' : 'people have'} expressed interest</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posted By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={idea.poster.profilePhotoUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {getInitials(idea.poster.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 w-full">
                    <h3 className="font-semibold text-lg">{idea.poster.fullName}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        <span>{idea.poster.company}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Flat {idea.poster.flatNumber}</span>
                      </div>
                    </div>
                  </div>

                  {!isOwnIdea && (
                    <div className="w-full space-y-2 pt-4 border-t">
                      <JoinTeamModal
                        ideaId={idea.id}
                        ideaTitle={idea.title}
                        rolesNeeded={idea.rolesNeeded}
                        idToken={idToken}
                        variant="default"
                        size="default"
                      />
                      {hasExpressed ? (
                        <Button
                          className="w-full"
                          variant="outline"
                          disabled
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Interest Expressed
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => setIsExpressInterestOpen(true)}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Express Interest
                        </Button>
                      )}
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleChatPoster}
                        disabled={startChatMutation.isPending}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {startChatMutation.isPending ? "Opening..." : "Send Message"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1">Posted on</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(idea.createdAt), 'PPP')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {teamRosterData && teamRosterData.teamMembers.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({teamRosterData.teamMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamRosterData.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover-elevate">
                      <Avatar>
                        <AvatarImage src={member.applicant.profilePhotoUrl || undefined} />
                        <AvatarFallback>{getInitials(member.applicant.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{member.applicant.fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.applicant.company}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {member.roleAppliedFor}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {userId && (
          <div className="mt-8">
            <Card>
              <CardContent className="pt-6">
                <CommentSection ideaId={idea.id} currentUserId={userId} idToken={idToken} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={isExpressInterestOpen} onOpenChange={setIsExpressInterestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Express Interest</DialogTitle>
            <DialogDescription>
              Let {idea.poster.fullName} know you're interested in this idea. You can include an optional message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell them why you're interested or what you can contribute..."
                className="min-h-[120px]"
                disabled={expressInterestMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsExpressInterestOpen(false);
                setMessage("");
              }}
              disabled={expressInterestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExpressInterest}
              disabled={expressInterestMutation.isPending}
            >
              {expressInterestMutation.isPending ? "Submitting..." : "Express Interest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
