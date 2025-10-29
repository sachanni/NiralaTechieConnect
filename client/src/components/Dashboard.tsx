import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import BadgeDisplay from "./BadgeDisplay";
import { Trophy, Star, Users, Edit, ExternalLink, Rocket, Search, MessageCircle } from "lucide-react";
import confetti from 'canvas-confetti';
import { useEffect } from "react";
import { useLocation } from "wouter";

interface DashboardProps {
  user: {
    fullName: string;
    company: string;
    flatNumber: string;
    email: string;
    techStack: string[];
    yearsOfExperience: number;
    linkedinUrl?: string;
    githubUrl?: string;
    profilePhotoUrl?: string;
    points: number;
    badges: string[];
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getInitials = () => {
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const nextLevelPoints = 100;
  const progressToNextLevel = (user.points / nextLevelPoints) * 100;

  const handleFindTeammates = () => {
    setLocation('/find-teammates');
  };

  const handleMessages = () => {
    setLocation('/chat');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Nirala Techie</h1>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-card-border">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={user.profilePhotoUrl} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{user.fullName}</h2>
                  <Badge variant="secondary" className="h-6">
                    {user.flatNumber}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">
                  {user.company} • {user.yearsOfExperience} years experience
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {user.techStack.slice(0, 5).map((tech) => (
                    <Badge key={tech} variant="outline" className="font-mono text-xs h-6">
                      {tech}
                    </Badge>
                  ))}
                  {user.techStack.length > 5 && (
                    <Badge variant="outline" className="h-6">
                      +{user.techStack.length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {user.linkedinUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(user.linkedinUrl, '_blank')}
                      className="hover-elevate active-elevate-2"
                      data-testid="button-linkedin"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      LinkedIn
                    </Button>
                  )}
                  {user.githubUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(user.githubUrl, '_blank')}
                      className="hover-elevate active-elevate-2"
                      data-testid="button-github"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      GitHub
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover-elevate active-elevate-2"
                    data-testid="button-edit-profile"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground" data-testid="text-points">
                {user.points}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Level Progress</span>
                  <span>{user.points}/{nextLevelPoints}</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Trophy className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground" data-testid="text-badge-count">
                {user.badges.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep participating to earn more!
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={handleMessages}
            data-testid="card-messages"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                No new messages
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            onClick={handleFindTeammates}
            data-testid="card-find-teammates"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Find Teammates</CardTitle>
              <Search className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">24</div>
              <p className="text-xs text-muted-foreground mt-1">
                IT professionals in your area
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Your Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeDisplay badges={user.badges} size="lg" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Welcome to Nirala Techie! 🎉
                </h3>
                <p className="text-muted-foreground">
                  You've earned <strong className="text-foreground">50 points</strong> for completing your profile. 
                  Start connecting with fellow developers!
                </p>
              </div>
              <Button 
                size="lg"
                onClick={handleFindTeammates}
                className="h-12 px-8 hover-elevate active-elevate-2 whitespace-nowrap"
                data-testid="button-explore"
              >
                Explore Community
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
