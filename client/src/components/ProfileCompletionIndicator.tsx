import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isComplete: boolean;
}

interface ProfileCompletionIndicatorProps {
  user: {
    fullName: string;
    email: string;
    flatNumber: string;
    dateOfBirth?: string;
    towerName?: string;
    bio?: string;
    occupation?: string;
    employmentStatus?: string;
    company?: string;
    yearsOfExperience?: number;
    briefIntro?: string;
    professionalWebsite?: string;
    serviceCategories?: string[];
    categoryRoles?: Record<string, string[]>;
    techStack?: string[];
    certifications?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    profilePhotoUrl?: string;
  };
  showDetails?: boolean;
  compact?: boolean;
}

export default function ProfileCompletionIndicator({
  user,
  showDetails = true,
  compact = false,
}: ProfileCompletionIndicatorProps) {
  const [, setLocation] = useLocation();

  const sections: ProfileSection[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Name, location, and bio',
      fields: ['fullName', 'email', 'flatNumber', 'dateOfBirth', 'towerName', 'bio', 'profilePhotoUrl'],
      isComplete: !!(
        user.fullName &&
        user.email &&
        user.flatNumber &&
        user.dateOfBirth &&
        user.towerName &&
        user.bio &&
        user.profilePhotoUrl
      ),
    },
    {
      id: 'professional',
      title: 'Professional Info',
      description: 'Occupation and work details',
      fields: ['occupation', 'employmentStatus', 'company', 'yearsOfExperience', 'briefIntro'],
      isComplete: !!(
        user.occupation &&
        user.employmentStatus &&
        user.company &&
        user.yearsOfExperience &&
        user.briefIntro
      ),
    },
    {
      id: 'services',
      title: 'Services & Roles',
      description: 'What you offer or seek',
      fields: ['serviceCategories', 'categoryRoles'],
      isComplete: !!(
        user.serviceCategories &&
        user.serviceCategories.length > 0 &&
        user.categoryRoles &&
        Object.keys(user.categoryRoles).length > 0
      ),
    },
    {
      id: 'skills',
      title: 'Skills & Expertise',
      description: 'Tech stack and certifications',
      fields: ['techStack'],
      isComplete: !!(user.techStack && user.techStack.length > 0),
    },
    {
      id: 'social',
      title: 'Social Links',
      description: 'Professional profiles',
      fields: ['linkedinUrl', 'githubUrl', 'professionalWebsite'],
      isComplete: !!(user.linkedinUrl || user.githubUrl || user.professionalWebsite),
    },
  ];

  const completedSections = sections.filter((s) => s.isComplete).length;
  const completionPercentage = Math.round((completedSections / sections.length) * 100);

  if (completionPercentage === 100) {
    return null; // Don't show if profile is complete
  }

  if (compact) {
    return (
      <Card className="hover-elevate cursor-pointer" onClick={() => setLocation('/profile/edit')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Profile Completion</p>
                <Badge variant="secondary">{completionPercentage}%</Badge>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Complete Your Profile</CardTitle>
            <CardDescription>
              {completionPercentage}% complete • {completedSections} of {sections.length} sections
            </CardDescription>
          </div>
          <Badge variant={completionPercentage >= 80 ? 'default' : 'secondary'} className="text-lg px-3 py-1">
            {completionPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={completionPercentage} className="h-2" />

          {showDetails && (
            <>
              <div className="space-y-2 mt-4">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
                  >
                    {section.isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${section.isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {section.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                onClick={() => setLocation('/profile/edit')}
                data-testid="button-complete-profile"
              >
                Complete Your Profile
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
