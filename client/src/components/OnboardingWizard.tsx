import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Users, Lightbulb, MessageSquare, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  company: string;
  techStack: string[];
  flatNumber: string;
}

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
  idToken: string;
}

const availableSkills = [
  "React", "Angular", "Vue", "Node.js", "Python", "Java", "Go", "TypeScript",
  "JavaScript", "AWS", "Azure", "Docker", "Kubernetes", "MongoDB", "PostgreSQL",
  "GraphQL", "REST APIs", "System Design", "Microservices", "DevOps"
];

export default function OnboardingWizard({ open, onComplete, userId, idToken }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedTeach, setSelectedTeach] = useState<string[]>([]);
  const [selectedLearn, setSelectedLearn] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: neighborsData } = useQuery<{ users: User[] }>({
    queryKey: ['/api/users/search'],
    queryFn: async () => {
      const response = await fetch('/api/users/search', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch neighbors');
      return response.json();
    },
    enabled: open,
  });

  const updateSkillsMutation = useMutation({
    mutationFn: async (data: { skillsToTeach: string[]; skillsToLearn: string[] }) => {
      const response = await fetch('/api/users/skills', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update skills');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to complete onboarding');
      return response.json();
    },
    onSuccess: () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast({
        title: "Welcome to Nirala Techie! 🎉",
        description: "You're all set to connect with your tech neighbors",
      });
      onComplete();
    },
  });

  const neighbors = (neighborsData?.users ?? []).filter(u => u.id !== userId).slice(0, 5);

  const handleNext = async () => {
    if (step === 2) {
      if (selectedTeach.length > 0 || selectedLearn.length > 0) {
        await updateSkillsMutation.mutateAsync({
          skillsToTeach: selectedTeach,
          skillsToLearn: selectedLearn,
        });
      }
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboardingMutation.mutate();
    }
  };

  const handleComplete = async () => {
    completeOnboardingMutation.mutate();
  };

  const toggleSkillTeach = (skill: string) => {
    setSelectedTeach(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleSkillLearn = (skill: string) => {
    setSelectedLearn(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Welcome to Nirala Techie!
          </DialogTitle>
          <DialogDescription>
            Let's get you connected with your tech neighbors in 3 quick steps
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Users className="w-5 h-5 text-primary" />
              Meet Your Tech Neighbors
            </div>
            <p className="text-sm text-muted-foreground">
              Here are some residents nearby with tech skills. You can connect with them for projects, mentorship, or coffee chats!
            </p>
            
            <div className="space-y-3">
              {neighbors.length > 0 ? (
                neighbors.map((neighbor) => (
                  <Card key={neighbor.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {neighbor.profilePhotoUrl ? (
                          <img
                            src={neighbor.profilePhotoUrl}
                            alt={neighbor.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {getInitials(neighbor.fullName)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{neighbor.fullName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {neighbor.company} • {neighbor.flatNumber}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {neighbor.techStack.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No neighbors found yet. Be among the first to join!
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Lightbulb className="w-5 h-5 text-primary" />
              Share Your Expertise
            </div>
            <p className="text-sm text-muted-foreground">
              Select skills you can teach and skills you want to learn. This helps neighbors find you!
            </p>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">I can teach:</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.slice(0, 12).map((skill) => (
                    <div
                      key={skill}
                      onClick={() => toggleSkillTeach(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        selectedTeach.includes(skill)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">I want to learn:</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.slice(0, 12).map((skill) => (
                    <div
                      key={skill}
                      onClick={() => toggleSkillLearn(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        selectedLearn.includes(skill)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="w-5 h-5 text-primary" />
              Take Your First Step
            </div>
            <p className="text-sm text-muted-foreground">
              Here's how you can start connecting with your neighbors:
            </p>

            <div className="space-y-3">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Join the Tech Forum</h4>
                      <p className="text-sm text-muted-foreground">
                        Share war stories, get career advice from 15-20 year veterans, and ask for architecture reviews
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Find Teammates</h4>
                      <p className="text-sm text-muted-foreground">
                        Discover neighbors with skills for your next side project or startup idea
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Book a Skill Swap Session</h4>
                      <p className="text-sm text-muted-foreground">
                        Learn from a neighbor or teach what you know - all happening in your building!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={completeOnboardingMutation.isPending}
          >
            {step === 3 ? 'Skip for now' : 'Skip'}
          </Button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={completeOnboardingMutation.isPending}
              >
                Back
              </Button>
            )}
            <Button
              onClick={step === 3 ? handleComplete : handleNext}
              disabled={updateSkillsMutation.isPending || completeOnboardingMutation.isPending}
            >
              {step === 3 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Get Started
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
