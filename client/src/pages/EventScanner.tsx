import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  SwitchCamera,
  AlertCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Html5Qrcode } from "html5-qrcode";
import confetti from "canvas-confetti";

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
  organizer: User;
  rsvpCount: number;
  checkinCount: number;
}

interface CheckinRecord {
  id: string;
  eventId: string;
  userId: string;
  checkedInAt: string;
  pointsAwarded: number;
  user: User;
}

interface EventScannerProps {
  userId: string;
  idToken: string;
}

export default function EventScanner({ userId, idToken }: EventScannerProps) {
  const [, params] = useRoute("/events/:id/scan");
  const eventId = params?.id;
  const { toast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    message: string;
    userName?: string;
    points?: number;
  } | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitializedRef = useRef(false);

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery<{ event: Event }>({
    queryKey: [`/api/events/${eventId}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    enabled: !!eventId,
  });

  const { data: checkinsData, refetch: refetchCheckins } = useQuery<{ checkins: CheckinRecord[] }>({
    queryKey: [`/api/events/${eventId}/checkins`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/checkins`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized: Only the event organizer can view check-ins');
        }
        throw new Error('Failed to fetch check-ins');
      }
      return response.json();
    },
    enabled: !!eventId && !!idToken && eventData?.event?.organizerId === userId,
    refetchInterval: 5000,
  });

  const checkinMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      const response = await fetch('/api/events/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ qrCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check in attendee');
      }

      return data;
    },
    onSuccess: (data) => {
      setLastScanResult({
        success: true,
        message: 'Check-in successful!',
        userName: data.user?.fullName,
        points: data.pointsAwarded,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });

      toast({
        title: "Check-in Successful! ✓",
        description: `${data.user?.fullName} has been checked in (+${data.pointsAwarded} points)`,
      });

      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      refetchCheckins();
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to check in attendee';
      
      setLastScanResult({
        success: false,
        message: errorMessage,
      });

      toast({
        title: "Check-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const initializeScanner = async () => {
    try {
      setScannerError(null);
      
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        setCameras(devices.map(device => ({
          id: device.id,
          label: device.label || `Camera ${device.id}`,
        })));
        
        const preferredCamera = devices.find(device => 
          device.label.toLowerCase().includes('back')
        ) || devices[0];
        
        setSelectedCameraId(preferredCamera.id);
      } else {
        setScannerError('No cameras found on this device');
      }
    } catch (error: any) {
      console.error('Error getting cameras:', error);
      setScannerError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const startScanning = async () => {
    if (!selectedCameraId) {
      setScannerError('No camera selected');
      return;
    }

    try {
      if (scannerRef.current) {
        await stopScanning();
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (!checkinMutation.isPending) {
            checkinMutation.mutate(decodedText);
          }
        },
        (errorMessage) => {
        }
      );

      setIsScanning(true);
      setScannerError(null);
      setLastScanResult(null);
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      setScannerError('Failed to start camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (error: any) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;

    const currentIndex = cameras.findIndex(cam => cam.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    setSelectedCameraId(nextCamera.id);

    if (isScanning) {
      await stopScanning();
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  };

  useEffect(() => {
    if (!isInitializedRef.current && eventData?.event?.organizerId === userId) {
      isInitializedRef.current = true;
      initializeScanner();
    }
  }, [eventData, userId]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Skeleton className="h-64 w-full max-w-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (eventError || !eventData?.event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
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

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-orange-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unauthorized Access</h3>
          <p className="text-muted-foreground mb-4">Only the event organizer can access the QR scanner.</p>
          <Link href={`/events/${eventId}`}>
            <Button>Back to Event Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  const checkinPercentage = event.rsvpCount > 0 
    ? (event.checkinCount / event.rsvpCount) * 100 
    : 0;

  const recentCheckins = checkinsData?.checkins?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href={`/events/${eventId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event Details
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">QR Code Scanner</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Organizer Mode
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Check-in Progress</h3>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {event.checkinCount} / {event.rsvpCount}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={checkinPercentage} 
                    className="h-3 mb-2"
                  />
                  
                  <p className="text-sm text-muted-foreground">
                    {checkinPercentage.toFixed(0)}% of registered attendees have checked in
                  </p>
                </div>

                <Separator />

                <div 
                  id="qr-reader" 
                  className="w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-border"
                  style={{ minHeight: isScanning ? '300px' : '100px' }}
                />

                {scannerError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">{scannerError}</p>
                    </div>
                  </div>
                )}

                {lastScanResult && (
                  <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                    lastScanResult.success
                      ? 'bg-green-50 border-green-200'
                      : lastScanResult.message.includes('already')
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {lastScanResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        lastScanResult.message.includes('already')
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`} />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className={`font-medium ${
                        lastScanResult.success
                          ? 'text-green-900'
                          : lastScanResult.message.includes('already')
                          ? 'text-orange-900'
                          : 'text-red-900'
                      }`}>
                        {lastScanResult.message}
                      </p>
                      {lastScanResult.userName && (
                        <p className={`text-sm ${
                          lastScanResult.success ? 'text-green-800' : 'text-gray-700'
                        }`}>
                          {lastScanResult.userName}
                          {lastScanResult.points && ` (+${lastScanResult.points} points)`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isScanning ? (
                    <Button 
                      onClick={startScanning}
                      className="flex-1"
                      disabled={!selectedCameraId}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Start Scanning
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopScanning}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Stop Scanning
                    </Button>
                  )}
                  
                  {cameras.length > 1 && (
                    <Button 
                      onClick={switchCamera}
                      variant="outline"
                      disabled={!isScanning}
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => {
                      setLastScanResult(null);
                      setScannerError(null);
                    }}
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 space-y-1">
                    <p className="font-medium">Instructions:</p>
                    <ul className="space-y-1">
                      <li>• Click "Start Scanning" to activate the camera</li>
                      <li>• Ask attendees to show their QR code</li>
                      <li>• Position the QR code within the frame</li>
                      <li>• The check-in will happen automatically</li>
                      <li>• You'll see a success message and confetti animation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No check-ins yet</p>
                    <p className="text-xs mt-1">Start scanning to check in attendees</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCheckins.map((checkin) => (
                      <div 
                        key={checkin.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={checkin.user.profilePhotoUrl || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(checkin.user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {checkin.user.fullName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTimeAgo(checkin.checkedInAt)}</span>
                            <span>•</span>
                            <span className="text-green-600 font-medium">
                              +{checkin.pointsAwarded} pts
                            </span>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total RSVPs</span>
                    <span className="font-semibold">{event.rsvpCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Checked In</span>
                    <span className="font-semibold text-green-600">{event.checkinCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Not Checked In</span>
                    <span className="font-semibold text-orange-600">
                      {event.rsvpCount - event.checkinCount}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-semibold">{event.maxAttendees}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
