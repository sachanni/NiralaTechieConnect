import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, Video, MapPin, Users, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isPast } from "date-fns";
import ReviewSessionModal from "@/components/ReviewSessionModal";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  company: string;
}

interface Session {
  id: string;
  mentorId: string;
  learnerId: string;
  skillTopic: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  sessionType: string;
  meetingLink?: string | null;
  status: string;
  createdAt: string;
  mentor: User;
  learner: User;
  hasReviewed?: boolean;
}

interface MySessionsProps {
  userId: string;
  idToken: string;
}

export default function MySessions({ userId, idToken }: MySessionsProps) {
  const { toast } = useToast();
  const [cancelSessionId, setCancelSessionId] = useState<string | null>(null);
  const [reviewSession, setReviewSession] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery<{ sessions: Session[] }>({
    queryKey: ['/api/skill-swap/my-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/skill-swap/my-sessions', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    },
    enabled: !!idToken,
  });

  const cancelMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/skill-swap/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel session');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Cancelled",
        description: "The session has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skill-swap/my-sessions'] });
      setCancelSessionId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel Session",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const upcomingSessions = (data?.sessions || []).filter((session) => {
    const sessionDateTime = parseISO(`${session.sessionDate}T12:00:00`);
    return !isPast(sessionDateTime) && session.status === 'scheduled';
  });

  const pastSessions = (data?.sessions || []).filter((session) => {
    const sessionDateTime = parseISO(`${session.sessionDate}T12:00:00`);
    return isPast(sessionDateTime) || session.status === 'completed' || session.status === 'cancelled';
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderSessionCard = (session: Session, isPastSession: boolean) => {
    const isMentor = session.mentorId === userId;
    const otherPerson = isMentor ? session.learner : session.mentor;

    return (
      <Card key={session.id} className="hover-elevate">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={otherPerson.profilePhotoUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(otherPerson.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isMentor ? "default" : "secondary"} className="text-xs">
                  {isMentor ? 'Mentor' : 'Learner'}
                </Badge>
                {session.status === 'cancelled' && (
                  <Badge variant="destructive" className="text-xs">
                    Cancelled
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {otherPerson.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {otherPerson.company}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Skill Topic</p>
              <Badge variant="outline" className="font-mono">
                {session.skillTopic}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date
                </p>
                <p className="text-sm font-medium">
                  {format(parseISO(session.sessionDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Time
                </p>
                <p className="text-sm font-medium">
                  {session.sessionTime} ({session.duration} min)
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                {session.sessionType === 'Virtual' ? (
                  <Video className="w-3 h-3" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                Session Type
              </p>
              <Badge variant="outline" className="text-xs">
                {session.sessionType}
              </Badge>
            </div>

            {!isPastSession && session.status !== 'cancelled' && (
              <div className="flex gap-2 pt-2">
                {session.sessionType === 'Virtual' && session.meetingLink && (
                  <Button
                    onClick={() => window.open(session.meetingLink!, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setCancelSessionId(session.id)}
                  className="flex-1"
                >
                  Cancel Session
                </Button>
              </div>
            )}

            {isPastSession && session.status !== 'cancelled' && !session.hasReviewed && (
              <Button
                onClick={() =>
                  setReviewSession({
                    id: session.id,
                    name: otherPerson.fullName,
                  })
                }
                className="w-full"
              >
                Leave Review
              </Button>
            )}

            {isPastSession && session.hasReviewed && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Review submitted
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">My Sessions</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/skill-swap" className="hidden md:block">
                <Button variant="outline">Find Mentors</Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your learning and teaching sessions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Book a session with a mentor to get started!
                  </p>
                  <Link href="/skill-swap">
                    <Button>Find Mentors</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingSessions.map((session) => renderSessionCard(session, false))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No past sessions</h3>
                  <p className="text-muted-foreground">
                    Your completed sessions will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastSessions.map((session) => renderSessionCard(session, true))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <AlertDialog
        open={!!cancelSessionId}
        onOpenChange={(open) => !open && setCancelSessionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelSessionId && cancelMutation.mutate(cancelSessionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {reviewSession && (
        <ReviewSessionModal
          sessionId={reviewSession.id}
          revieweeName={reviewSession.name}
          idToken={idToken}
          isOpen={!!reviewSession}
          onClose={() => setReviewSession(null)}
        />
      )}
    </div>
  );
}
