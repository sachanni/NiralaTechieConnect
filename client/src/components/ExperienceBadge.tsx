import { Badge } from "@/components/ui/badge";
import { Shield, Award, Star, Crown, Gem } from "lucide-react";

interface ExperienceBadgeProps {
  yearsOfExperience: number;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function getExperienceBadge(years: number): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  icon: React.ReactNode;
  color: string;
} {
  if (years >= 20) {
    return {
      label: "Veteran",
      variant: "default",
      icon: <Gem className="w-3 h-3" />,
      color: "text-purple-600 dark:text-purple-400"
    };
  } else if (years >= 15) {
    return {
      label: "Expert",
      variant: "default",
      icon: <Crown className="w-3 h-3" />,
      color: "text-yellow-600 dark:text-yellow-400"
    };
  } else if (years >= 10) {
    return {
      label: "Senior",
      variant: "secondary",
      icon: <Star className="w-3 h-3" />,
      color: "text-blue-600 dark:text-blue-400"
    };
  } else if (years >= 5) {
    return {
      label: "Mid-Level",
      variant: "outline",
      icon: <Award className="w-3 h-3" />,
      color: "text-green-600 dark:text-green-400"
    };
  } else {
    return {
      label: "Junior",
      variant: "outline",
      icon: <Shield className="w-3 h-3" />,
      color: "text-gray-600 dark:text-gray-400"
    };
  }
}

export default function ExperienceBadge({ 
  yearsOfExperience, 
  className = "",
  showIcon = true,
  size = 'sm'
}: ExperienceBadgeProps) {
  const badge = getExperienceBadge(yearsOfExperience);
  
  const sizeClasses = {
    sm: 'text-xs h-5',
    md: 'text-sm h-6',
    lg: 'text-base h-7'
  };

  return (
    <Badge 
      variant={badge.variant} 
      className={`${sizeClasses[size]} ${badge.color} flex items-center gap-1 ${className}`}
    >
      {showIcon && badge.icon}
      <span>{badge.label}</span>
    </Badge>
  );
}
