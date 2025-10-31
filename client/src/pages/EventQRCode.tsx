import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  QrCode as QrCodeIcon, 
  Download,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import QRCode from "qrcode";

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

interface EventQRCodeProps {
  userId: string;
  idToken: string;
}

export default function EventQRCode({ userId, idToken }: EventQRCodeProps) {
  const [, params] = useRoute("/events/:id/qr-code");
  const eventId = params?.id;
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery<{ event: Event }>({
    queryKey: [`/api/events/${eventId}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    enabled: !!eventId,
  });

  const { data: qrCodeData, isLoading: qrLoading, error: qrError } = useQuery<{ qrCode: string }>({
    queryKey: [`/api/events/${eventId}/generate-qr`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/generate-qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate QR code');
      }

      return response.json();
    },
    enabled: !!eventId && !!idToken,
  });

  const { data: rsvpsData } = useQuery<{ rsvps: EventRsvp[] }>({
    queryKey: ['/api/events/my-rsvps'],
    queryFn: async () => {
      const response = await fetch('/api/events/my-rsvps', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        return { rsvps: [] };
      }

      return response.json();
    },
    enabled: !!idToken,
  });

  useEffect(() => {
    if (qrCodeData?.qrCode) {
      QRCode.toDataURL(qrCodeData.qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error('Error generating QR code image:', err);
          toast({
            title: "QR Code Error",
            description: "Failed to generate QR code image",
            variant: "destructive",
          });
        });
    }
  }, [qrCodeData, toast]);

  useEffect(() => {
    if (rsvpsData?.rsvps && eventId) {
      const currentEventRsvp = rsvpsData.rsvps.find(rsvp => rsvp.eventId === eventId);
      setIsCheckedIn(currentEventRsvp?.checkedIn || false);
    }
  }, [rsvpsData, eventId]);

  const handleDownloadQRCode = () => {
    if (!qrCodeDataUrl || !eventData?.event) return;

    const link = document.createElement('a');
    link.download = `event-qr-${eventData.event.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been saved successfully",
    });
  };

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  if (eventLoading || qrLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Skeleton className="h-[300px] w-[300px]" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (eventError || qrError || !eventData?.event) {
    const errorMessage = qrError 
      ? (qrError as Error).message 
      : "Unable to load event or generate QR code";

    const isRsvpError = errorMessage.includes("RSVP") || errorMessage.includes("rsvp");

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <Link href="/events">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <QrCodeIcon className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Event QR Code</h1>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isRsvpError ? "RSVP Required" : "Unable to Load QR Code"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isRsvpError 
                    ? "You need to RSVP to this event before you can access your QR code."
                    : errorMessage}
                </p>
                <div className="flex gap-3 justify-center">
                  {eventId && (
                    <Link href={`/events/${eventId}`}>
                      <Button>View Event Details</Button>
                    </Link>
                  )}
                  <Link href="/events">
                    <Button variant="outline">Browse Events</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const event = eventData.event;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/events/${eventId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event Details
              </Button>
            </Link>
            <Link href="/my-events">
              <Button variant="ghost" size="sm">
                My Events
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Your Event QR Code</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {isCheckedIn ? (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Checked In ✓
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Not Checked In
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{formatEventDate(event.eventDate)}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{event.eventTime}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{event.location}</span>
                </div>
              </div>

              <Separator />

              <div className="bg-white rounded-lg p-8 border-2 border-border flex flex-col items-center">
                {qrCodeDataUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Event QR Code"
                      className="w-[300px] h-[300px] mx-auto"
                    />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground font-mono break-all px-4">
                        Code: {qrCodeData?.qrCode.slice(0, 20)}...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-[300px] h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-900">How to check in:</p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Show this code to the event organizer</li>
                      <li>• They will scan it to confirm your attendance</li>
                      <li>• This code is unique to you for this event</li>
                      <li>• Keep this page accessible during the event</li>
                    </ul>
                  </div>
                </div>

                {isCheckedIn && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900">You're all set!</p>
                      <p className="text-green-800">You've been successfully checked in to this event.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleDownloadQRCode}
                  className="flex-1"
                  variant="outline"
                  disabled={!qrCodeDataUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                <Link href={`/events/${eventId}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Event Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <QrCodeIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">About Your QR Code</p>
                  <p>
                    This QR code contains your unique event check-in identifier. 
                    Keep it secure and only show it to authorized event staff. 
                    You can download it for offline access if needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
