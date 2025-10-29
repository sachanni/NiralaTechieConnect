import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TechStackSelector from "./TechStackSelector";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RegistrationFormProps {
  phoneNumber: string;
  idToken: string;
  onComplete: (data: RegistrationData) => void;
}

export interface RegistrationData {
  fullName: string;
  flatNumber: string;
  email: string;
  company: string;
  techStack: string[];
  yearsOfExperience: number;
  linkedinUrl?: string;
  githubUrl?: string;
  profilePhotoUrl?: string;
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Professional', description: 'Your work experience' },
  { id: 3, title: 'Skills', description: 'Your tech expertise' },
  { id: 4, title: 'Finish', description: 'Almost there!' },
];

export default function RegistrationForm({ phoneNumber, idToken, onComplete }: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    flatNumber: '',
    email: '',
    company: '',
    techStack: [],
    yearsOfExperience: 0,
    linkedinUrl: '',
    githubUrl: '',
    profilePhotoUrl: '',
  });

  const updateField = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.flatNumber && formData.email;
      case 2:
        return formData.company && formData.yearsOfExperience > 0;
      case 3:
        return formData.techStack.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-4">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center ${
                    step.id === currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <div className="text-xs font-medium">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="John Doe"
                    className="h-12"
                    data-testid="input-fullname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flatNumber">Flat Number</Label>
                  <Input
                    id="flatNumber"
                    value={formData.flatNumber}
                    onChange={(e) => updateField('flatNumber', e.target.value)}
                    placeholder="A-1204"
                    className="h-12"
                    data-testid="input-flat"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email ID</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john@example.com"
                    className="h-12"
                    data-testid="input-email"
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">Current Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    placeholder="Google, Microsoft, Startup Inc."
                    className="h-12"
                    data-testid="input-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience || ''}
                    onChange={(e) => updateField('yearsOfExperience', parseInt(e.target.value) || 0)}
                    placeholder="5"
                    className="h-12"
                    data-testid="input-experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile (Optional)</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedinUrl}
                    onChange={(e) => updateField('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                    className="h-12"
                    data-testid="input-linkedin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Profile (Optional)</Label>
                  <Input
                    id="github"
                    value={formData.githubUrl}
                    onChange={(e) => updateField('githubUrl', e.target.value)}
                    placeholder="https://github.com/johndoe"
                    className="h-12"
                    data-testid="input-github"
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <TechStackSelector
                selected={formData.techStack}
                onChange={(stack) => updateField('techStack', stack)}
              />
            )}

            {currentStep === 4 && (
              <ProfilePhotoUpload
                value={formData.profilePhotoUrl || null}
                onChange={(url) => updateField('profilePhotoUrl', url || '')}
                userName={formData.fullName}
                idToken={idToken}
              />
            )}

            <div className="flex gap-4 pt-4">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="h-12 hover-elevate active-elevate-2"
                  data-testid="button-back"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 h-12 hover-elevate active-elevate-2"
                data-testid="button-next"
              >
                {currentStep === 4 ? 'Complete Registration' : 'Next'}
                {currentStep < 4 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
