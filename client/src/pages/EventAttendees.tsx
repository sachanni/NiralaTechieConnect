import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  FileDown, 
  Search, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  MessageCircle,
  CalendarDays,
  UserCheck,
  TrendingUp,
  QrCode as QrCodeIcon,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface CheckinRecord {
  id: string;
  eventId: string;
  userId: string;
  checkedInAt: string;
  pointsAwarded: number;
  user: User;
}

interface AttendeeData extends EventRsvp {
  checkedIn: boolean;
  checkedInAt?: string;
}

interface EventAttendeesProps {
  userId: string;
  idToken: string;
}

export default function EventAttendees({ userId, idToken }: EventAttendeesProps) {
  const [, params] = useRoute("/events/:id/attendees");
  const eventId = params?.id;
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "checked-in" | "not-checked-in">("all");
  const [sortBy, setSortBy] = useState<"name" | "rsvp-date" | "checkin-status">("rsvp-date");
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [generatingQR, setGeneratingQR] = useState(false);

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery<{ event: Event }>({
    queryKey: [`/api/events/${eventId}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    enabled: !!eventId,
  });

  const { data: rsvpsData, isLoading: rsvpsLoading } = useQuery<{ rsvps: EventRsvp[] }>({
    queryKey: [`/api/events/${eventId}/rsvps`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/rsvps`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch RSVPs');
      }
      return response.json();
    },
    enabled: !!eventId && !!idToken && eventData?.event?.organizerId === userId,
    refetchInterval: 10000,
  });

  const { data: checkinsData } = useQuery<{ checkins: CheckinRecord[] }>({
    queryKey: [`/api/events/${eventId}/checkins`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/checkins`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { checkins: [] };
      return response.json();
    },
    enabled: !!eventId && !!idToken && eventData?.event?.organizerId === userId,
    refetchInterval: 10000,
  });

  const event = eventData?.event;
  const rsvps = rsvpsData?.rsvps || [];
  const checkins = checkinsData?.checkins || [];

  const attendees: AttendeeData[] = rsvps.map(rsvp => {
    const checkin = checkins.find(c => c.userId === rsvp.userId);
    return {
      ...rsvp,
      checkedIn: !!checkin,
      checkedInAt: checkin?.checkedInAt,
    };
  });

  const filteredAttendees = attendees
    .filter(attendee => {
      const matchesSearch = attendee.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           attendee.user.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           attendee.user.flatNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterStatus === "all" ||
        (filterStatus === "checked-in" && attendee.checkedIn) ||
        (filterStatus === "not-checked-in" && !attendee.checkedIn);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.user.fullName.localeCompare(b.user.fullName);
        case "rsvp-date":
          return new Date(b.rsvpedAt).getTime() - new Date(a.rsvpedAt).getTime();
        case "checkin-status":
          if (a.checkedIn === b.checkedIn) {
            return a.user.fullName.localeCompare(b.user.fullName);
          }
          return a.checkedIn ? -1 : 1;
        default:
          return 0;
      }
    });

  const stats = {
    totalRsvps: rsvps.length,
    totalCheckins: checkins.length,
    checkinPercentage: rsvps.length > 0 ? (checkins.length / rsvps.length) * 100 : 0,
    capacityRemaining: event ? event.maxAttendees - rsvps.length : 0,
  };

  const handleExportCSV = () => {
    if (!event || attendees.length === 0) return;

    const headers = ['Name', 'Flat Number', 'Company', 'RSVP Date', 'Checked In', 'Check-in Time'];
    const rows = attendees.map(attendee => [
      attendee.user.fullName,
      attendee.user.flatNumber,
      attendee.user.company,
      format(new Date(attendee.rsvpedAt), 'MMM d, yyyy h:mm a'),
      attendee.checkedIn ? 'Yes' : 'No',
      attendee.checkedInAt ? format(new Date(attendee.checkedInAt), 'MMM d, yyyy h:mm a') : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const sanitizedTitle = event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    link.setAttribute('href', url);
    link.setAttribute('download', `event-${sanitizedTitle}-attendees.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Downloaded",
      description: `Successfully exported ${attendees.length} attendees.`,
    });
  };

  const handleWhatsAppContact = (phoneNumber: string, userName: string) => {
    const message = encodeURIComponent(`Hi ${userName}, thank you for registering for "${event?.title}"!`);
    window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleGenerateQR = async (attendee: AttendeeData) => {
    setGeneratingQR(true);
    try {
      const response = await fetch(`/api/events/${eventId}/generate-qr-for-attendee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ attendeeId: attendee.userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate QR code');
      }

      const { qrCode } = await response.json();
      
      const qrDataUrl = await QRCode.toDataURL(qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeDataUrl(qrDataUrl);
      setSelectedAttendee(attendee);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl || !selectedAttendee) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qr-${selectedAttendee.user.fullName.replace(/\s+/g, '-').toLowerCase()}-${event?.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: `QR code for ${selectedAttendee.user.fullName} has been downloaded.`,
    });
  };

  if (eventLoading || rsvpsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
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

  const isOrganizer = event.organizerId === userId;

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unauthorized Access</h3>
          <p className="text-muted-foreground mb-4">Only the event organizer can view attendees.</p>
          <Link href={`/events/${eventId}`}>
            <Button>Back to Event Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href={`/events/${eventId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event Details
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Event Attendees</h1>
              </div>
              <p className="text-muted-foreground">{event.title}</p>
            </div>
            <Button onClick={handleExportCSV} disabled={attendees.length === 0}>
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-700">{stats.totalRsvps}</div>
                  <div className="text-sm text-blue-600 font-medium mt-1">Total RSVPs</div>
                </div>
                <UserCheck className="w-8 h-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-700">{stats.totalCheckins}</div>
                  <div className="text-sm text-green-600 font-medium mt-1">Checked In</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-700">
                    {stats.checkinPercentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-purple-600 font-medium mt-1">Check-in Rate</div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-700">{stats.capacityRemaining}</div>
                  <div className="text-sm text-orange-600 font-medium mt-1">Spots Remaining</div>
                </div>
                <Users className="w-8 h-8 text-orange-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, or flat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Attendees</SelectItem>
                  <SelectItem value="checked-in">Checked In Only</SelectItem>
                  <SelectItem value="not-checked-in">Not Checked In</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="rsvp-date">RSVP Date (Newest)</SelectItem>
                  <SelectItem value="checkin-status">Check-in Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredAttendees.length > 0 ? (
          <>
            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Attendee</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Flat</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">RSVP Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Check-in Time</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredAttendees.map((attendee) => (
                          <tr key={attendee.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={attendee.user.profilePhotoUrl || undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(attendee.user.fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{attendee.user.fullName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {attendee.user.flatNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {attendee.user.company}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {format(new Date(attendee.rsvpedAt), 'MMM d, yyyy')}
                              <div className="text-xs text-muted-foreground/70">
                                {format(new Date(attendee.rsvpedAt), 'h:mm a')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {attendee.checkedIn ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Checked In
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Not Checked In
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {attendee.checkedInAt ? (
                                <>
                                  {format(new Date(attendee.checkedInAt), 'MMM d, yyyy')}
                                  <div className="text-xs text-muted-foreground/70">
                                    {format(new Date(attendee.checkedInAt), 'h:mm a')}
                                  </div>
                                </>
                              ) : (
                                <span className="text-muted-foreground/50">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleGenerateQR(attendee)}
                                  disabled={generatingQR}
                                  title="View QR Code"
                                >
                                  <QrCodeIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleWhatsAppContact(attendee.user.phoneNumber, attendee.user.fullName)}
                                  title="Contact via WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:hidden space-y-4">
              {filteredAttendees.map((attendee) => (
                <Card key={attendee.id} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={attendee.user.profilePhotoUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {getInitials(attendee.user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{attendee.user.fullName}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Flat {attendee.user.flatNumber}</p>
                          <p>{attendee.user.company}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">RSVP Date:</span>
                        <span className="font-medium">
                          {format(new Date(attendee.rsvpedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        {attendee.checkedIn ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Checked In
                          </Badge>
                        )}
                      </div>

                      {attendee.checkedInAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Check-in Time:</span>
                          <span className="font-medium">
                            {format(new Date(attendee.checkedInAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => handleGenerateQR(attendee)}
                          disabled={generatingQR}
                        >
                          <QrCodeIcon className="w-4 h-4 mr-2" />
                          View QR Code
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => handleWhatsAppContact(attendee.user.phoneNumber, attendee.user.fullName)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : rsvps.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No RSVPs Yet</h3>
            <p className="text-muted-foreground mb-6">
              Attendees will appear here as they RSVP to your event
            </p>
            <Link href={`/events/${eventId}`}>
              <Button variant="outline">
                Back to Event Details
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}

        {filteredAttendees.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {filteredAttendees.length} of {attendees.length} attendees
            {filterStatus !== "all" && ` (filtered by ${filterStatus.replace('-', ' ')})`}
            • Auto-refreshing every 10 seconds
          </div>
        )}
      </div>

      <Dialog open={!!selectedAttendee} onOpenChange={() => setSelectedAttendee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5" />
              QR Code for {selectedAttendee?.user.fullName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {qrCodeDataUrl && (
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-80 h-80 border-4 border-background rounded-lg shadow-lg"
                />
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2 text-sm text-blue-800 dark:text-blue-200">
                <CalendarDays className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">For Event: {event?.title}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    This QR code is unique to {selectedAttendee?.user.fullName} and can be scanned at the event for check-in.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadQR}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => setSelectedAttendee(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
