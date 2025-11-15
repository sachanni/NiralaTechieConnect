import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PasswordInputWithValidation from "./PasswordInputWithValidation";
import { TOWER_OPTIONS, type RoleType } from "../../../shared/serviceCategories";
import { evaluatePassword } from "@/lib/passwordValidation";
import { Info } from "lucide-react";

interface RegistrationFormProps {
  phoneNumber: string;
  idToken: string;
  selectedCategories: string[];
  onComplete: (data: RegistrationData) => void;
}

export interface RegistrationData {
  fullName: string;
  flatNumber: string;
  email: string;
  password?: string;
  occupation: string;
  employmentStatus: string;
  briefIntro?: string;
  professionalWebsite?: string;
  company: string;
  techStack: string[];
  yearsOfExperience: number;
  certifications?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  profilePhotoUrl?: string;
  serviceCategories?: string[];
  categoryRoles?: Record<string, RoleType[]>;
  dateOfBirth?: string;
  towerName?: string;
  societyName?: string;
  residencyType?: string;
  residentSince?: string;
}

export default function RegistrationForm({ phoneNumber, idToken, selectedCategories, onComplete }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    flatNumber: '',
    email: '',
    password: '',
    towerName: '',
    societyName: 'Nirala Estate',
    occupation: '',
    employmentStatus: '',
    company: '',
    techStack: [],
    yearsOfExperience: 0,
    categoryRoles: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canSubmit = () => {
    const passwordValidation = evaluatePassword(formData.password || '');
    return formData.fullName.trim() && 
           formData.flatNumber.trim() && 
           formData.email.trim() && 
           passwordValidation.isValid &&
           !isSubmitting;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;
    
    setIsSubmitting(true);
    onComplete({
      ...formData,
      serviceCategories: selectedCategories,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Registration</CardTitle>
          <CardDescription>
            Join the Nirala Techie Connect community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-md p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <p className="font-medium mb-1">Quick Registration</p>
                  <p className="text-muted-foreground">
                    Fill in the essentials now. You can complete your profile details later in settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="John Doe"
                data-testid="input-fullname"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john.doe@example.com"
                data-testid="input-email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordInputWithValidation
                value={formData.password || ''}
                onChange={(value) => updateField('password', value)}
                data-testid="input-password"
              />
            </div>

            {/* Tower Name */}
            <div className="space-y-2">
              <Label htmlFor="towerName">Tower Name</Label>
              <Input
                id="towerName"
                value={formData.towerName}
                onChange={(e) => updateField('towerName', e.target.value)}
                placeholder="Enter your tower name (optional)"
                data-testid="input-tower"
              />
            </div>

            {/* Flat Number */}
            <div className="space-y-2">
              <Label htmlFor="flatNumber">Flat Number *</Label>
              <Input
                id="flatNumber"
                value={formData.flatNumber}
                onChange={(e) => updateField('flatNumber', e.target.value)}
                placeholder="A-1204"
                data-testid="input-flat"
              />
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!canSubmit()}
              data-testid="button-complete-registration"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By registering, you agree to our terms and conditions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
