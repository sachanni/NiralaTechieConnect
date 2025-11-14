import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Briefcase, Users, TrendingUp, ArrowRight, Settings } from "lucide-react";
import { useLocation } from "wouter";

interface SuggestionsSidebarProps {
  neighbors?: any[];
  events?: any[];
  jobs?: any[];
  servicesCount?: number;
  stats?: {
    totalMembers?: number;
    activeToday?: number;
    totalServices?: number;
  };
}

export default function SuggestionsSidebar({ neighbors, events, jobs, servicesCount, stats }: SuggestionsSidebarProps) {
  const [, setLocation] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            My Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {servicesCount === 0 
              ? "Let neighbors know which services you offer or need"
              : `You have ${servicesCount} active service${servicesCount !== 1 ? 's' : ''}`
            }
          </p>
          <Button 
            variant="default" 
            size="sm" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={() => setLocation('/my-services')}
          >
            {servicesCount === 0 ? "Set Up Services" : "Manage Services"} <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {neighbors && neighbors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Connect with Neighbors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {neighbors.slice(0, 3).map((neighbor) => (
              <div 
                key={neighbor.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setLocation(`/profile/${neighbor.id}`)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={neighbor.profilePhotoUrl || undefined} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(neighbor.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{neighbor.fullName}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{neighbor.company || neighbor.flatNumber}</p>
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full" 
              onClick={() => setLocation('/find-teammates')}
            >
              See All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {events && events.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div 
                key={event.id} 
                className="p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setLocation(`/events/${event.id}`)}
              >
                <p className="text-sm font-medium line-clamp-1">{event.title || 'Untitled Event'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {event.eventDate && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </Badge>
                  )}
                  {event.location && (
                    <span className="text-xs text-muted-foreground line-clamp-1">{event.location}</span>
                  )}
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full" 
              onClick={() => setLocation('/events')}
            >
              See All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {jobs && jobs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.slice(0, 2).map((job) => (
              <div 
                key={job.id} 
                className="p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setLocation('/jobs')}
              >
                <p className="text-sm font-medium line-clamp-1">{job.jobTitle}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{job.companyName}</p>
                <div className="flex gap-1 mt-2">
                  {job.requiredTechStack?.slice(0, 2).map((tech: string) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full" 
              onClick={() => setLocation('/jobs')}
            >
              See All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {stats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Platform Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-semibold">{stats.totalMembers || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Today</span>
                <span className="font-semibold text-green-600">{stats.activeToday || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Services</span>
                <span className="font-semibold">{stats.totalServices || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
