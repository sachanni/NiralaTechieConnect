import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  userId: string;
  idToken?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLastSeen?: boolean;
}

function formatLastSeen(lastSeenAt: string): string {
  const now = new Date();
  const lastSeen = new Date(lastSeenAt);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Active now";
  if (diffMins < 60) return `Active ${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
  if (diffHours < 24) return `Active ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `Active ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return "Offline";
}

export default function PresenceIndicator({ 
  userId, 
  idToken, 
  className,
  size = "md",
  showLastSeen = false
}: PresenceIndicatorProps) {
  const { data: presenceData } = useQuery({
    queryKey: [`/api/presence/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/presence/${userId}`, {
        headers: idToken ? {
          'Authorization': `Bearer ${idToken}`
        } : {}
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const isOnline = presenceData?.status === 'online';
  const lastSeenAt = presenceData?.lastSeenAt;

  // Show last seen text even when offline, if enabled
  if (showLastSeen && lastSeenAt) {
    const lastSeenText = isOnline ? "Online" : formatLastSeen(lastSeenAt);
    return (
      <span className={cn("text-xs text-muted-foreground flex items-center gap-1.5", className)}>
        {isOnline && <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>}
        {lastSeenText}
      </span>
    );
  }

  // Default dot indicator (only when online)
  if (!isOnline) {
    return null;
  }

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span 
      className={cn(
        "inline-block rounded-full bg-green-500 ring-2 ring-background",
        sizeClasses[size],
        className
      )}
      title="Online"
    />
  );
}
