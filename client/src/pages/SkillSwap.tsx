import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Search, Star, Users, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useChat } from "@/hooks/useChat";
import BookSessionModal from "@/components/BookSessionModal";

interface Mentor {
  id: string;
  fullName: string;
  company: string;
  profilePhotoUrl?: string | null;
  skillsToTeach: string[];
  mentorRating: number;
  totalSessionsTaught: number;
  flatNumber: string;
}

interface SkillSwapProps {
  userId: string;
  idToken: string;
}

export default function SkillSwap({ userId, idToken }: SkillSwapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const { toast } = useToast();
  const { openChat } = useChat();

  const { data, isLoading } = useQuery<{ mentors: Mentor[] }>({
    queryKey: ['/api/skill-swap/matches'],
    queryFn: async () => {
      const response = await fetch('/api/skill-swap/matches', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch mentors');
      return response.json();
    },
    enabled: !!idToken,
  });

  const filteredMentors = (data?.mentors || []).filter((mentor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      mentor.fullName.toLowerCase().includes(query) ||
      mentor.company.toLowerCase().includes(query) ||
      mentor.skillsToTeach.some((skill) => skill.toLowerCase().includes(query))
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleBookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsBookModalOpen(true);
  };

  const startChatMutation = useMutation({
    mutationFn: async (mentor: Mentor) => {
      if (!idToken) {
        throw new Error('Please log in to start a chat');
      }
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId: mentor.id }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return { ...await response.json(), mentor };
    },
    onSuccess: (data) => {
      const conversationId = data.conversation.id;
      const mentor = data.mentor;
      
      // Open chat popup instead of redirecting
      openChat(conversationId, {
        id: mentor.id,
        fullName: mentor.fullName,
        profilePhotoUrl: mentor.profilePhotoUrl,
        company: mentor.company,
        flatNumber: mentor.flatNumber,
      });
      
      toast({
        title: "Chat opened!",
        description: `Now chatting with ${mentor.fullName}`,
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

  const handleStartChat = (mentor: Mentor) => {
    startChatMutation.mutate(mentor);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating / 20);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Find Your Mentor</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/my-sessions" className="hidden md:block">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  My Sessions
                </Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Learn from your tech community neighbors
          </p>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, company, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding mentors...</p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No matching mentors found' : 'No mentors available yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Check back later or become a mentor yourself!'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Found {filteredMentors.length} mentor{filteredMentors.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={mentor.profilePhotoUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(mentor.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">
                          {mentor.fullName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {mentor.company}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {mentor.flatNumber}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Can teach:</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.skillsToTeach.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs font-mono">
                              {skill}
                            </Badge>
                          ))}
                          {mentor.skillsToTeach.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{mentor.skillsToTeach.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          {renderStars(mentor.mentorRating)}
                          <span className="ml-1 text-muted-foreground">
                            ({(mentor.mentorRating / 20).toFixed(1)})
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {mentor.totalSessionsTaught} session{mentor.totalSessionsTaught !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleStartChat(mentor)}
                          variant="outline"
                          disabled={startChatMutation.isPending}
                          className="w-full"
                        >
                          {startChatMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-current rounded-full animate-spin" />
                              Opening...
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleBookSession(mentor)}
                          className="w-full"
                        >
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedMentor && (
        <BookSessionModal
          mentorId={selectedMentor.id}
          mentorName={selectedMentor.fullName}
          skillsOffered={selectedMentor.skillsToTeach}
          idToken={idToken}
          isOpen={isBookModalOpen}
          onClose={() => {
            setIsBookModalOpen(false);
            setSelectedMentor(null);
          }}
        />
      )}
    </div>
  );
}
