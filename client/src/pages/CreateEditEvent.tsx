import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, ArrowLeft, CalendarDays, Loader2, MapPin, Users, Clock, Image as ImageIcon } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  eventType: z.enum(["it_meetup", "community"], {
    required_error: "Please select an event type",
  }),
  eventDate: z.date({
    required_error: "Please select a date for the event",
  }).refine((date) => date > new Date(), {
    message: "Event date must be in the future",
  }),
  eventTime: z.string().min(1, "Please select a time for the event").regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format (e.g., 18:00)"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  maxAttendees: z.coerce.number().min(1, "Must have at least 1 attendee").max(1000, "Maximum 1000 attendees allowed"),
  imageUrl: z.string().refine(
    (val) => !val || val.startsWith('/uploads/') || /^https?:\/\//.test(val),
    "Must be a valid URL or uploaded image path"
  ).optional().or(z.literal("")),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface Event {
  id: string;
  title: string;
  description: string;
  eventType?: string;
  location: string;
  eventDate: string;
  eventTime: string;
  organizerId: string;
  maxAttendees: number;
  imageUrl?: string | null;
  status: string;
}

interface CreateEditEventProps {
  userId?: string;
  idToken: string;
}

const timeOptions = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
  "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30",
];

export default function CreateEditEvent({ userId, idToken }: CreateEditEventProps) {
  const params = useParams();
  const eventId = params.id;
  const isEditMode = !!eventId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "community",
      eventDate: undefined,
      eventTime: "",
      location: "",
      maxAttendees: 50,
      imageUrl: "",
    },
  });

  const { data: eventData, isLoading: isLoadingEvent, error: eventError } = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const response = await fetch(`/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch event');
      }
      return response.json();
    },
    enabled: isEditMode,
    retry: false,
  });

  useEffect(() => {
    if (eventData) {
      if (userId && eventData.organizerId !== userId) {
        toast({
          title: "Unauthorized",
          description: "You are not the organizer of this event",
          variant: "destructive",
        });
        setLocation('/events');
        return;
      }

      form.reset({
        title: eventData.title,
        description: eventData.description,
        eventType: (eventData.eventType as "it_meetup" | "community") || "community",
        eventDate: new Date(eventData.eventDate),
        eventTime: eventData.eventTime,
        location: eventData.location,
        maxAttendees: eventData.maxAttendees,
        imageUrl: eventData.imageUrl || "",
      });
    }
  }, [eventData, userId, form, toast, setLocation]);

  useEffect(() => {
    if (eventError) {
      toast({
        title: "Error",
        description: eventError instanceof Error ? eventError.message : "Failed to load event",
        variant: "destructive",
      });
      setLocation('/events');
    }
  }, [eventError, toast, setLocation]);

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const eventDate = data.eventDate instanceof Date 
        ? data.eventDate.toISOString() 
        : new Date(data.eventDate).toISOString();
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          eventDate,
          status: 'upcoming',
          imageUrl: data.imageUrl || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Event Created!",
        description: "Your event has been created successfully.",
      });
      setTimeout(() => {
        setLocation(`/events/${data.event.id}`);
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const eventDate = data.eventDate instanceof Date 
        ? data.eventDate.toISOString() 
        : new Date(data.eventDate).toISOString();
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          eventDate,
          imageUrl: data.imageUrl || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Event Updated!",
        description: "Your event has been updated successfully.",
      });
      setTimeout(() => {
        setLocation(`/events/${eventId}`);
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormValues) => {
    if (isEditMode) {
      updateEventMutation.mutate(data);
    } else {
      createEventMutation.mutate(data);
    }
  };

  const isPending = createEventMutation.isPending || updateEventMutation.isPending;
  const description = form.watch("description");
  const descriptionLength = description?.length || 0;
  const imageUrl = form.watch("imageUrl");
  const title = form.watch("title");
  const eventDate = form.watch("eventDate");
  const eventTime = form.watch("eventTime");
  const location = form.watch("location");
  const maxAttendees = form.watch("maxAttendees");

  if (isEditMode && isLoadingEvent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/events">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Event' : 'Create Event'}</h1>
          </div>
          <p className="text-muted-foreground">
            {isEditMode 
              ? 'Update your event details and settings' 
              : 'Organize a meetup or networking event for your community'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>
                      Fill in the information about your event
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., React Meetup & Networking"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your event, what attendees can expect, agenda, etc..."
                              rows={6}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="flex justify-between">
                            <span>Provide a detailed description of your event</span>
                            <span className={cn(
                              "font-medium",
                              descriptionLength < 50 ? "text-destructive" : "text-muted-foreground"
                            )}>
                              {descriptionLength} / 50 characters
                            </span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="it_meetup">IT Meetup (Tech workshops, coding sessions, developer networking)</SelectItem>
                              <SelectItem value="community">Community Event (Festivals, celebrations, social gatherings)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose whether this is a professional IT event or a community celebration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Event Date *</FormLabel>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setCalendarOpen(false);
                                  }}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Select a future date for your event
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="eventTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Time *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {timeOptions.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              24-hour format (e.g., 18:00)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Community Hall, Building A or Online (Zoom link)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify the venue or provide a virtual meeting link
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxAttendees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Attendees *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50"
                              min={1}
                              max={1000}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Set the capacity limit (1-1000 attendees)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Image (Optional)</FormLabel>
                          <div className="space-y-3">
                            <FormControl>
                              <Input
                                placeholder="https://example.com/event-image.jpg"
                                {...field}
                              />
                            </FormControl>
                            <div className="flex items-center gap-2">
                              <div className="h-px flex-1 bg-border" />
                              <span className="text-xs text-muted-foreground">OR</span>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                            <div>
                              <Input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                disabled={isUploadingImage}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  if (file.size > 5 * 1024 * 1024) {
                                    toast({
                                      title: "File too large",
                                      description: "Maximum file size is 5MB",
                                      variant: "destructive",
                                    });
                                    return;
                                  }

                                  setIsUploadingImage(true);
                                  const formData = new FormData();
                                  formData.append('image', file);

                                  try {
                                    const response = await fetch('/api/events/upload-image', {
                                      method: 'POST',
                                      headers: {
                                        'Authorization': `Bearer ${idToken}`,
                                      },
                                      body: formData,
                                    });

                                    if (!response.ok) {
                                      throw new Error('Upload failed');
                                    }

                                    const data = await response.json();
                                    form.setValue('imageUrl', data.imageUrl);
                                    toast({
                                      title: "Image uploaded",
                                      description: "Event image uploaded successfully",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Upload failed",
                                      description: "Failed to upload image. Please try again.",
                                      variant: "destructive",
                                    });
                                  } finally {
                                    setIsUploadingImage(false);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              {isUploadingImage && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Uploading image...
                                </p>
                              )}
                            </div>
                          </div>
                          <FormDescription>
                            Provide an image URL or upload a photo (max 5MB, JPG/PNG/GIF/WebP)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isPending || !form.formState.isValid}
                        className="flex-1"
                      >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isPending 
                          ? (isEditMode ? 'Updating...' : 'Creating...') 
                          : (isEditMode ? 'Update Event' : 'Create Event')}
                      </Button>
                      <Link href="/events">
                        <Button type="button" variant="outline" disabled={isPending}>
                          Cancel
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>How your event will appear</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {imageUrl ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border">
                    <img 
                      src={imageUrl} 
                      alt="Event preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.classList.add('bg-muted');
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center border">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className={cn(
                      "font-semibold text-lg leading-tight",
                      !title && "text-muted-foreground"
                    )}>
                      {title || "Event Title"}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    {eventDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{format(eventDate, "PPP")}</span>
                      </div>
                    )}

                    {eventTime && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{eventTime}</span>
                      </div>
                    )}

                    {location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{location}</span>
                      </div>
                    )}

                    {maxAttendees && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Up to {maxAttendees} attendees</span>
                      </div>
                    )}
                  </div>

                  {description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
