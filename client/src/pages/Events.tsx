import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Clock, CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  fullName: string;
  company: string;
  profilePhotoUrl?: string | null;
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
  eventType?: string;
  status: string;
  createdAt: string;
  organizer: User;
  rsvpCount: number;
  checkinCount: number;
}

type EventTimeType = "upcoming" | "past";
type EventCategoryType = "all" | "it_meetup" | "community";

interface EventsProps {
  userId?: string;
  idToken?: string;
}

export default function Events({ userId, idToken }: EventsProps = {}) {
  const [eventTimeType, setEventTimeType] = useState<EventTimeType>("upcoming");
  const [eventCategory, setEventCategory] = useState<EventCategoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const baseEndpoint = eventTimeType === "upcoming" ? "/api/events" : "/api/events/past";
  const endpoint = eventCategory !== "all" 
    ? `${baseEndpoint}?eventType=${eventCategory}` 
    : baseEndpoint;

  const { data, isLoading, error } = useQuery<{ events: Event[] }>({
    queryKey: [baseEndpoint, eventCategory],
    queryFn: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    retry: 1,
  });

  if (error) {
    toast({
      title: "Error loading events",
      description: "Failed to fetch events. Please try again.",
      variant: "destructive",
    });
  }

  const filteredEvents = (data?.events || []).filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.organizer.fullName.toLowerCase().includes(query)
    );
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
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getAttendeeBadgeColor = (rsvpCount: number, maxAttendees: number) => {
    const percentage = (rsvpCount / maxAttendees) * 100;
    if (percentage >= 90) return "bg-red-100 text-red-700";
    if (percentage >= 70) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Events</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/events/create">
                <Button>Create Event</Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">
            Join tech meetups and networking events in your community
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Tabs value={eventCategory} onValueChange={(value) => setEventCategory(value as EventCategoryType)} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All Events</TabsTrigger>
                  <TabsTrigger value="it_meetup">IT Meetups</TabsTrigger>
                  <TabsTrigger value="community">Community Events</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={eventTimeType} onValueChange={(value) => setEventTimeType(value as EventTimeType)} className="w-auto">
                <TabsList>
                  <TabsTrigger value="upcoming" className="gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger value="past" className="gap-1.5">
                    <Clock className="w-4 h-4" />
                    Past
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative flex-1 max-w-md w-full">
                <Input
                  placeholder="Search events, locations, or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No matching events found' : `No ${eventTimeType} events`}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : eventType === 'upcoming' 
                  ? 'Check back soon for new events!' 
                  : 'No past events to display'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const spotsRemaining = event.maxAttendees - event.rsvpCount;
                const isAlmostFull = spotsRemaining <= event.maxAttendees * 0.2;
                
                return (
                  <Card 
                    key={event.id} 
                    className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-border hover:border-primary/50"
                  >
                    {event.imageUrl ? (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <Badge variant="secondary" className="bg-white/90 text-black">
                            {formatEventDate(event.eventDate)}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-48 w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                        <CalendarDays className="w-16 h-16 text-primary/40" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <Badge variant="secondary">
                            {formatEventDate(event.eventDate)}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{event.eventTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getAttendeeBadgeColor(event.rsvpCount, event.maxAttendees)}`}
                            >
                              {event.rsvpCount} / {event.maxAttendees} attending
                            </Badge>
                            {isAlmostFull && eventType === 'upcoming' && (
                              <Badge variant="destructive" className="text-xs">
                                Almost Full!
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {event.organizer.profilePhotoUrl ? (
                            <img
                              src={event.organizer.profilePhotoUrl}
                              alt={event.organizer.fullName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {getInitials(event.organizer.fullName)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {event.organizer.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {event.organizer.company}
                            </p>
                          </div>
                        </div>

                        <Link href={`/events/${event.id}`}>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="gap-1 group-hover:gap-2 transition-all"
                          >
                            View
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
