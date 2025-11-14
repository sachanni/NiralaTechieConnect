import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, Users, Briefcase, TrendingUp, ShoppingCart, 
  Wrench, Search, Camera, Megaphone, MessageCircle, Store,
  Lightbulb, CalendarDays, MessagesSquare
} from "lucide-react";
import { useLocation } from "wouter";

interface UserProfileSidebarProps {
  user: {
    fullName: string;
    profilePhotoUrl?: string | null;
    points?: number;
    badges?: string[];
  };
  stats?: {
    contributions?: number;
    connections?: number;
  };
}

export default function UserProfileSidebar({ user, stats }: UserProfileSidebarProps) {
  const [, setLocation] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const mainFeatures = [
    { icon: Users, label: "Find Teammates", path: "/find-teammates" },
    { icon: Briefcase, label: "Job Board", path: "/jobs" },
    { icon: TrendingUp, label: "Skill Swap", path: "/skill-swap" },
    { icon: Lightbulb, label: "Ideas", path: "/ideas" },
    { icon: CalendarDays, label: "Events", path: "/events" },
    { icon: MessagesSquare, label: "Forum", path: "/forum" },
  ];

  const communityFeatures = [
    { icon: ShoppingCart, label: "Marketplace", path: "/marketplace" },
    { icon: Store, label: "Services", path: "/services" },
    { icon: Wrench, label: "Tool Rental", path: "/tool-rental" },
    { icon: Search, label: "Lost & Found", path: "/lost-and-found" },
    { icon: Camera, label: "Photo Gallery", path: "/photo-gallery" },
    { icon: Megaphone, label: "Announcements", path: "/announcements" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3 border-2 border-primary/20">
              <AvatarImage src={user.profilePhotoUrl || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg mb-1">{user.fullName}</h3>
            {user.points !== undefined && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>{user.points} points</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold">{stats?.contributions || 0}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.connections || 0}</div>
                <div className="text-xs text-muted-foreground">Connections</div>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setLocation('/profile')}
          >
            View Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Main Features</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1">
            {mainFeatures.map((feature) => (
              <button 
                key={feature.path}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                onClick={() => setLocation(feature.path)}
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{feature.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Community</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1">
            {communityFeatures.map((feature) => (
              <button 
                key={feature.path}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                onClick={() => setLocation(feature.path)}
              >
                <feature.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{feature.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
