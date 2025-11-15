import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  QrCode, 
  UserCheck, 
  Edit, 
  MessageCircle,
  CalendarDays,
  CheckCircle2,
  XCircle,
  MessageSquareQuote,
  Download,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useChat } from "@/contexts/ChatContext";
import QRCodeGenerator from "qrcode";

interface User {
  id: string;
  fullName: string;
  company: string;
  profilePhotoUrl?: string | null;
  flatNumber: string;
  phoneNumber: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  eventTime: string;
  organizerId: string;
  maxAttendees: number;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
  organizer: User;
  rsvpCount: number;
  checkinCount: number;
}

interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  rsvpedAt: string;
  user: User;
}

interface EventDetailsProps {
  userId?: string;
  idToken?: string;
}

export default function EventDetails({ userId, idToken }: EventDetailsProps = {}) {
  const [, params] = useRoute("/events/:id");
  const [, navigate] = useLocation();
  const eventId = params?.id;
  const { toast } = useToast();
  const { openChat } = useChat();
  const [showFeedbackQR, setShowFeedbackQR] = useState(false);
  const [feedbackQRCode, setFeedbackQRCode] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery<{ event: Event }>({
    queryKey: [`/api/events/${eventId}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    enabled: !!eventId,
  });

  const { data: rsvpsData } = useQuery<{ rsvps: EventRsvp[] }>({
    queryKey: [`/api/events/${eventId}/rsvps`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/rsvps`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { rsvps: [] };
      return response.json();
    },
    enabled: !!eventId && !!idToken && !!userId && eventData?.event?.organizerId === userId,
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to RSVP');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "RSVP Confirmed!",
        description: "You've successfully registered for this event.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/rsvps`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: any) => {
      toast({
        title: "RSVP Failed",
        description: error.message || "Failed to RSVP to event",
        variant: "destructive",
      });
    },
  });

  const cancelRsvpMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel RSVP');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "RSVP Cancelled",
        description: "Your registration has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/rsvps`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel RSVP",
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

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getCapacityColor = (rsvpCount: number, maxAttendees: number) => {
    const percentage = (rsvpCount / maxAttendees) * 100;
    if (percentage >= 95) return "text-red-600";
    if (percentage >= 80) return "text-orange-600";
    return "text-green-600";
  };

  const getCapacityBadgeColor = (rsvpCount: number, maxAttendees: number) => {
    const percentage = (rsvpCount / maxAttendees) * 100;
    if (percentage >= 95) return "bg-red-100 text-red-700 border-red-200";
    if (percentage >= 80) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const startChatMutation = useMutation({
    mutationFn: async (organizer: User) => {
      if (!idToken) {
        throw new Error('Please log in to start a chat');
      }
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId: organizer.id }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return { ...await response.json(), organizer };
    },
    onSuccess: (data) => {
      const conversationId = data.conversation.id;
      const organizer = data.organizer;
      
      openChat(conversationId, {
        id: organizer.id,
        fullName: organizer.fullName,
        profilePhotoUrl: organizer.profilePhotoUrl,
        company: organizer.company,
        flatNumber: organizer.flatNumber,
      });
      
      toast({
        title: "Chat opened!",
        description: `Now chatting with ${organizer.fullName}`,
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

  const handleChatOrganizer = () => {
    if (!event?.organizer) return;
    startChatMutation.mutate(event.organizer);
  };

  const handleViewQRCode = () => {
    navigate(`/events/${eventId}/qr-code`);
  };

  const handleScanQRCodes = () => {
    navigate(`/events/${eventId}/scan`);
  };

  const handleViewAttendees = () => {
    navigate(`/events/${eventId}/attendees`);
  };

  const handleEditEvent = () => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleGenerateFeedbackQR = async () => {
    try {
      const feedbackUrl = `${window.location.origin}/feedback/${eventId}`;
      const qrCodeDataUrl = await QRCodeGenerator.toDataURL(feedbackUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#8b46de',
          light: '#ffffff',
        },
      });
      setFeedbackQRCode(qrCodeDataUrl);
      setShowFeedbackQR(true);
    } catch (error) {
      toast({
        title: "QR Generation Failed",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `feedback-qr-${eventId}.png`;
    link.href = feedbackQRCode;
    link.click();
    toast({
      title: "QR Code Downloaded",
      description: "QR code saved successfully",
    });
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <Skeleton className="h-64 w-full" />
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (eventError || !eventData?.event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CalendarDays className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Event Not Found</h3>
          <p className="text-muted-foreground mb-4">This event may have been removed or doesn't exist.</p>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const event = eventData.event;
  const isOrganizer = event.organizerId === userId;
  const hasRsvped = rsvpsData?.rsvps?.some(rsvp => rsvp.userId === userId) || false;
  const spotsRemaining = event.maxAttendees - event.rsvpCount;
  const isEventFull = spotsRemaining <= 0;
  const capacityPercentage = (event.rsvpCount / event.maxAttendees) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/events">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Event Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              {event.imageUrl ? (
                <div className="relative h-64 w-full overflow-hidden">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              ) : (
                <div className="relative h-64 w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <CalendarDays className="w-24 h-24 text-primary/40" />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-2xl flex-1">{event.title}</CardTitle>
                  {isEventFull && (
                    <Badge variant="destructive" className="flex-shrink-0">
                      Event Full
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">About This Event</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">{formatEventDate(event.eventDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">{event.eventTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Attendance</h3>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getCapacityBadgeColor(event.rsvpCount, event.maxAttendees)}
                    >
                      {event.rsvpCount} / {event.maxAttendees} attending
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={capacityPercentage} 
                    className="h-3"
                  />
                  
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className={`font-medium ${getCapacityColor(event.rsvpCount, event.maxAttendees)}`}>
                      {spotsRemaining > 0 ? `${spotsRemaining} spots remaining` : 'No spots remaining'}
                    </span>
                    <span className="text-muted-foreground">
                      {capacityPercentage.toFixed(0)}% capacity
                    </span>
                  </div>
                </div>

                {event.checkinCount > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{event.checkinCount} attendees checked in</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organized By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={event.organizer.profilePhotoUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {getInitials(event.organizer.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 w-full">
                    <h3 className="font-semibold text-lg">{event.organizer.fullName}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{event.organizer.company}</p>
                      <p className="text-sm text-muted-foreground">Flat {event.organizer.flatNumber}</p>
                    </div>
                  </div>

                  {!isOrganizer && userId && (
                    <div className="w-full pt-4 border-t">
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleChatOrganizer}
                        disabled={startChatMutation.isPending}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {startChatMutation.isPending ? "Opening..." : "Chat Organizer"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {userId && !isOrganizer && (
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {hasRsvped ? (
                    <>
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">You're registered!</span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleViewQRCode}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        View My QR Code
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => cancelRsvpMutation.mutate()}
                        disabled={cancelRsvpMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {cancelRsvpMutation.isPending ? "Cancelling..." : "Cancel RSVP"}
                      </Button>
                    </>
                  ) : isEventFull ? (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Event is at full capacity</span>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => rsvpMutation.mutate()}
                      disabled={rsvpMutation.isPending}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      {rsvpMutation.isPending ? "Registering..." : "RSVP to Event"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {isOrganizer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organizer Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleScanQRCodes}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR Codes
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleViewAttendees}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Attendees ({event.rsvpCount})
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleEditEvent}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleGenerateFeedbackQR}
                    data-testid="button-generate-feedback-qr"
                  >
                    <MessageSquareQuote className="w-4 h-4 mr-2" />
                    Generate Feedback QR
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate(`/events/${eventId}/feedback-dashboard`)}
                    data-testid="button-view-feedback"
                  >
                    <MessageSquareQuote className="w-4 h-4 mr-2" />
                    View Feedback
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1">Created on</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(event.createdAt), 'PPP')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Feedback QR Code Dialog */}
      <Dialog open={showFeedbackQR} onOpenChange={setShowFeedbackQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Feedback QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code with attendees to collect feedback
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* QR Code Display */}
            {feedbackQRCode && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-md border">
                  <img 
                    src={feedbackQRCode} 
                    alt="Feedback QR Code" 
                    className="w-full max-w-sm"
                  />
                </div>
                
                {/* Feedback URL */}
                <div className="w-full space-y-2">
                  <label className="text-sm font-medium">Feedback URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={`${window.location.origin}/feedback/${eventId}`}
                      className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/feedback/${eventId}`);
                        toast({
                          title: "Copied!",
                          description: "URL copied to clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* URL Shortener Suggestion */}
                <div className="w-full p-3 bg-primary/5 border border-primary/20 rounded-md">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-primary mb-1">Pro Tip: Use a URL Shortener</p>
                      <p className="text-muted-foreground">
                        For a cleaner look, shorten your URL using{" "}
                        <a
                          href="https://bitly.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          Bit.ly
                        </a>{" "}
                        or{" "}
                        <a
                          href="https://tinyurl.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          TinyURL
                        </a>
                        , then regenerate this QR code with the short link.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button 
                  onClick={handleDownloadQR} 
                  className="w-full"
                  data-testid="button-download-qr"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
