import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Calendar, Clock, MapPin, Users, QrCode, Trash2, CheckCircle, CalendarDays } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isPast } from "date-fns";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  company: string;
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
  event: Event;
  checkedIn: boolean;
}

interface MyEventsProps {
  userId: string;
  idToken: string;
}

export default function MyEvents({ userId, idToken }: MyEventsProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [cancelEventId, setCancelEventId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<{ rsvps: EventRsvp[] }>({
    queryKey: ['/api/events/my-rsvps'],
    queryFn: async () => {
      const response = await fetch('/api/events/my-rsvps', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch your events');
      return response.json();
    },
    enabled: !!idToken,
  });

  const cancelRsvpMutation = useMutation({
    mutationFn: async (eventId: string) => {
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
        description: "Your registration has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events/my-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setCancelEventId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel RSVP",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const upcomingEvents = (data?.rsvps || []).filter((rsvp) => {
    const eventDate = parseISO(rsvp.event.eventDate);
    return !isPast(eventDate);
  });

  const pastEvents = (data?.rsvps || []).filter((rsvp) => {
    const eventDate = parseISO(rsvp.event.eventDate);
    return isPast(eventDate);
  });

  const handleViewDetails = (eventId: string) => {
    setLocation(`/events/${eventId}`);
  };

  const handleViewQRCode = (eventId: string) => {
    setLocation(`/events/${eventId}/qr-code`);
  };

  const renderEventCard = (rsvp: EventRsvp, isPastEvent: boolean) => {
    const event = rsvp.event;

    return (
      <Card key={rsvp.id} className="hover-elevate overflow-hidden">
        <div className="relative h-40 w-full overflow-hidden">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <CalendarDays className="w-16 h-16 text-primary/40" />
            </div>
          )}
          {rsvp.checkedIn && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Checked In
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {event.title}
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  {format(parseISO(event.eventDate), 'MMM d, yyyy')}
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  {event.eventTime}
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-1">
                  {event.location}
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  {event.rsvpCount} / {event.maxAttendees} attending
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => handleViewDetails(event.id)}
                className="w-full"
                variant="outline"
              >
                View Details
              </Button>

              {!isPastEvent && (
                <>
                  <Button
                    onClick={() => handleViewQRCode(event.id)}
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCancelEventId(event.id)}
                    className="w-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel RSVP
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    toast({
      title: "Error Loading Events",
      description: "Failed to load your events. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">My Events</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/events" className="hidden md:block">
                <Button variant="outline">Browse Events</Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground">
            View and manage your event registrations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your events...</p>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-4">
                    RSVP to events to see them here!
                  </p>
                  <Link href="/events">
                    <Button>Browse Events</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((rsvp) => renderEventCard(rsvp, false))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No past events</h3>
                  <p className="text-muted-foreground">
                    Your attended events will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((rsvp) => renderEventCard(rsvp, true))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <AlertDialog
        open={!!cancelEventId}
        onOpenChange={(open) => !open && setCancelEventId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel RSVP?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your registration for this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelEventId && cancelRsvpMutation.mutate(cancelEventId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel RSVP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
