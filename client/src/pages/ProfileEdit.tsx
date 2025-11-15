import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ChevronLeft, Loader2, User, Briefcase, Award, Link as LinkIcon } from "lucide-react";
import TechStackSelector from "@/components/TechStackSelector";
import RoleSelector from "@/components/RoleSelector";
import OccupationSelector from "@/components/OccupationSelector";
import { TOWER_OPTIONS } from "../../../shared/serviceCategories";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";

interface ProfileEditProps {
  userId: string;
  idToken: string;
}

export default function ProfileEdit({ userId, idToken }: ProfileEditProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    dateOfBirth: '',
    towerName: '',
    flatNumber: '',
    bio: '',
    profilePhotoUrl: '',
    
    // Professional Info
    occupation: '',
    employmentStatus: '',
    company: '',
    yearsOfExperience: 0,
    briefIntro: '',
    professionalWebsite: '',
    
    // Services & Roles
    serviceCategories: [] as string[],
    categoryRoles: {} as Record<string, string[]>,
    
    // Skills
    techStack: [] as string[],
    certifications: '',
    
    // Social Links
    linkedinUrl: '',
    githubUrl: '',
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
    enabled: !!userId && !!idToken,
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || '',
        dateOfBirth: userData.dateOfBirth || '',
        towerName: userData.towerName || '',
        flatNumber: userData.flatNumber || '',
        bio: userData.bio || '',
        profilePhotoUrl: userData.profilePhotoUrl || '',
        occupation: userData.occupation || '',
        employmentStatus: userData.employmentStatus || '',
        company: userData.company || '',
        yearsOfExperience: userData.yearsOfExperience || 0,
        briefIntro: userData.briefIntro || '',
        professionalWebsite: userData.professionalWebsite || '',
        serviceCategories: userData.serviceCategories || [],
        categoryRoles: userData.categoryRoles || {},
        techStack: userData.techStack || [],
        certifications: userData.certifications || '',
        linkedinUrl: userData.linkedinUrl || '',
        githubUrl: userData.githubUrl || '',
      });
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      setLocation('/profile');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    updateMutation.mutate();
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/profile')}
              data-testid="button-back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Edit Profile</h1>
              <p className="text-sm text-muted-foreground">Update your information</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            data-testid="button-save-profile"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Photo</CardTitle>
            </div>
            <CardDescription>Upload a professional photo</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePhotoUpload
              currentPhotoUrl={formData.profilePhotoUrl}
              onPhotoUpdated={(url) => updateField('profilePhotoUrl', url)}
              idToken={idToken}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Basic Information</CardTitle>
            </div>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="John Doe"
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
                data-testid="input-dob"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="towerName">Tower Name</Label>
                <Select
                  value={formData.towerName}
                  onValueChange={(value) => updateField('towerName', value)}
                >
                  <SelectTrigger data-testid="select-tower">
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
                <Label htmlFor="flatNumber">Flat Number</Label>
                <Input
                  id="flatNumber"
                  value={formData.flatNumber}
                  onChange={(e) => updateField('flatNumber', e.target.value)}
                  placeholder="A-1204"
                  data-testid="input-flat"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                data-testid="textarea-bio"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Professional Information</CardTitle>
            </div>
            <CardDescription>Your work and career details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <OccupationSelector
              occupation={formData.occupation || ''}
              employmentStatus={formData.employmentStatus || ''}
              organizationName={formData.company || ''}
              onOccupationChange={(value) => updateField('occupation', value)}
              onEmploymentStatusChange={(value) => updateField('employmentStatus', value)}
              onOrganizationNameChange={(value) => updateField('company', value)}
            />

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={(e) => updateField('yearsOfExperience', parseInt(e.target.value) || 0)}
                data-testid="input-years-exp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="briefIntro">Professional Summary</Label>
              <Textarea
                id="briefIntro"
                value={formData.briefIntro}
                onChange={(e) => updateField('briefIntro', e.target.value)}
                placeholder="Brief introduction about your professional background..."
                rows={3}
                data-testid="textarea-intro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalWebsite">Professional Website</Label>
              <Input
                id="professionalWebsite"
                type="url"
                value={formData.professionalWebsite}
                onChange={(e) => updateField('professionalWebsite', e.target.value)}
                placeholder="https://yourwebsite.com"
                data-testid="input-website"
              />
            </div>
          </CardContent>
        </Card>

        {/* Services & Roles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Services & Roles</CardTitle>
            </div>
            <CardDescription>What services do you offer or seek?</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleSelector
              selectedCategories={formData.serviceCategories}
              categoryRoles={formData.categoryRoles}
              onCategoriesChange={(categories) => updateField('serviceCategories', categories)}
              onRolesChange={(roles) => updateField('categoryRoles', roles)}
            />
          </CardContent>
        </Card>

        {/* Skills & Expertise */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Skills & Expertise</CardTitle>
            </div>
            <CardDescription>Your technical skills and certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tech Stack</Label>
              <TechStackSelector
                selectedTech={formData.techStack}
                onChange={(stack) => updateField('techStack', stack)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                value={formData.certifications}
                onChange={(e) => updateField('certifications', e.target.value)}
                placeholder="AWS Certified Solutions Architect, Google Cloud Professional, etc."
                rows={3}
                data-testid="textarea-certs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              <CardTitle>Social Links</CardTitle>
            </div>
            <CardDescription>Connect your professional profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                data-testid="input-linkedin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub Profile</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => updateField('githubUrl', e.target.value)}
                placeholder="https://github.com/yourusername"
                data-testid="input-github"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button - Bottom */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setLocation('/profile')}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            data-testid="button-save-bottom"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
