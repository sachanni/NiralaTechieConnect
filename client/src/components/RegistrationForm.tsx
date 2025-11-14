import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import TechStackSelector from "./TechStackSelector";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import RoleSelector from "./RoleSelector";
import OccupationSelector from "./OccupationSelector";
import MultiCategorySkillSelector from "./MultiCategorySkillSelector";
import PasswordInputWithValidation from "./PasswordInputWithValidation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SERVICE_CATEGORIES, TOWER_OPTIONS, type RoleType } from "../../../shared/serviceCategories";
import { Textarea } from "@/components/ui/textarea";
import { evaluatePassword } from "@/lib/passwordValidation";

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

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Your Roles', description: 'Select your service roles' },
  { id: 3, title: 'About You', description: 'Your background' },
  { id: 4, title: 'Skills', description: 'Your expertise' },
  { id: 5, title: 'Finish', description: 'Almost there!' },
];

export default function RegistrationForm({ phoneNumber, idToken, selectedCategories, onComplete }: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    flatNumber: '',
    email: '',
    password: '',
    occupation: '',
    employmentStatus: '',
    briefIntro: '',
    professionalWebsite: '',
    company: '',
    techStack: [],
    yearsOfExperience: 0,
    certifications: '',
    linkedinUrl: '',
    githubUrl: '',
    profilePhotoUrl: '',
    categoryRoles: {},
    dateOfBirth: '',
    towerName: '',
    societyName: 'Nirala Estate',
    residencyType: '',
    residentSince: '',
  });

  const updateField = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        const passwordValidation = evaluatePassword(formData.password || '');
        return formData.fullName && formData.flatNumber && formData.email && passwordValidation.isValid;
      case 2:
        const hasRoles = Object.values(formData.categoryRoles || {}).some(roles => roles.length > 0);
        return hasRoles;
      case 3:
        return formData.occupation && formData.employmentStatus;
      case 4:
        return formData.techStack.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete({
        ...formData,
        serviceCategories: selectedCategories,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = (currentStep / 5) * 100;

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
                {selectedCategories.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Selected Categories:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map(catId => {
                        const category = SERVICE_CATEGORIES.find(c => c.id === catId);
                        return category ? (
                          <span
                            key={catId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            <span className="mr-1">{category.icon}</span>
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
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
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="societyName">Society Name</Label>
                  <Select 
                    value={formData.societyName} 
                    onValueChange={(value) => updateField('societyName', value)}
                    disabled
                  >
                    <SelectTrigger className="h-12 bg-gray-50">
                      <SelectValue placeholder="Select society" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nirala Estate">Nirala Estate</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Society name is auto-selected</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="towerName">Tower Name</Label>
                  <Select 
                    value={formData.towerName} 
                    onValueChange={(value) => updateField('towerName', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select tower" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOWER_OPTIONS.map(tower => (
                        <SelectItem key={tower} value={tower}>{tower}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flatNumber">Flat Number *</Label>
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
                  <Label>Residency Type</Label>
                  <RadioGroup 
                    value={formData.residencyType} 
                    onValueChange={(value) => updateField('residencyType', value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="owner" id="owner" />
                      <Label htmlFor="owner" className="cursor-pointer font-normal">Owner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tenant" id="tenant" />
                      <Label htmlFor="tenant" className="cursor-pointer font-normal">Tenant</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residentSince">Resident Since</Label>
                  <Input
                    id="residentSince"
                    type="date"
                    value={formData.residentSince}
                    onChange={(e) => updateField('residentSince', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email ID *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <PasswordInputWithValidation
                    value={formData.password || ''}
                    onChange={(value) => updateField('password', value)}
                    id="password"
                    placeholder="Create a secure password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use this email and password for all future logins
                  </p>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <RoleSelector
                selectedCategories={selectedCategories}
                categoryRoles={formData.categoryRoles || {}}
                onChange={(roles) => updateField('categoryRoles', roles)}
              />
            )}

            {currentStep === 3 && (
              <>
                <OccupationSelector
                  occupation={formData.occupation}
                  employmentStatus={formData.employmentStatus}
                  organizationName={formData.company}
                  onOccupationChange={(value) => updateField('occupation', value)}
                  onEmploymentStatusChange={(value) => updateField('employmentStatus', value)}
                  onOrganizationNameChange={(value) => updateField('company', value)}
                />
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="experience">Years of Experience (Optional)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience || ''}
                    onChange={(e) => updateField('yearsOfExperience', parseInt(e.target.value) || 0)}
                    placeholder="How many years of experience do you have?"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brief-intro">Brief Introduction (Optional)</Label>
                  <Textarea
                    id="brief-intro"
                    value={formData.briefIntro}
                    onChange={(e) => updateField('briefIntro', e.target.value)}
                    placeholder="E.g., 'I'm a yoga instructor with 10 years experience' or 'Homemaker who loves baking'"
                    className="min-h-20 resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500">{(formData.briefIntro || '').length}/200 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Professional Website or Portfolio (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.professionalWebsite}
                    onChange={(e) => updateField('professionalWebsite', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="h-12"
                  />
                </div>
              </>
            )}

            {currentStep === 4 && (
              <MultiCategorySkillSelector
                selected={formData.techStack}
                onChange={(stack) => updateField('techStack', stack)}
                occupation={formData.occupation}
                certifications={formData.certifications}
                onCertificationsChange={(value) => updateField('certifications', value)}
              />
            )}

            {currentStep === 5 && (
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
                {currentStep === 5 ? 'Complete Registration' : 'Next'}
                {currentStep < 5 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
