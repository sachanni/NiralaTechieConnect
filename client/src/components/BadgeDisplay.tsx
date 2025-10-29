import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Zap, Code, Award, Target } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BADGE_CONFIG: Record<string, { icon: any; color: string; description: string }> = {
  'React Ninja': { 
    icon: Code, 
    color: 'text-blue-500', 
    description: 'Master of React development' 
  },
  'Python Pro': { 
    icon: Star, 
    color: 'text-yellow-500', 
    description: 'Expert Python developer' 
  },
  'AWS Guru': { 
    icon: Zap, 
    color: 'text-orange-500', 
    description: 'Cloud infrastructure expert' 
  },
  'Node.js Expert': { 
    icon: Target, 
    color: 'text-green-500', 
    description: 'Backend specialist' 
  },
  'First Member': { 
    icon: Trophy, 
    color: 'text-purple-500', 
    description: 'Early community member' 
  },
  'Active Contributor': { 
    icon: Award, 
    color: 'text-pink-500', 
    description: 'Regular community participant' 
  },
};

interface BadgeDisplayProps {
  badges: string[];
  size?: 'sm' | 'lg';
}

export default function BadgeDisplay({ badges, size = 'lg' }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Complete your profile to earn badges!
        </p>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 ${size === 'lg' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-3 md:grid-cols-6'}`}>
      {badges.map((badgeName) => {
        const config = BADGE_CONFIG[badgeName] || { 
          icon: Award, 
          color: 'text-gray-500', 
          description: badgeName 
        };
        const Icon = config.icon;

        return (
          <Tooltip key={badgeName}>
            <TooltipTrigger asChild>
              <Card 
                className={`p-4 text-center cursor-pointer hover-elevate ${
                  size === 'sm' ? 'p-3' : ''
                }`}
                data-testid={`badge-${badgeName}`}
              >
                <Icon className={`w-${size === 'lg' ? '12' : '8'} h-${size === 'lg' ? '12' : '8'} mx-auto mb-2 ${config.color}`} />
                <p className={`${size === 'lg' ? 'text-sm' : 'text-xs'} font-medium text-foreground`}>
                  {badgeName}
                </p>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>{config.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
