import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Briefcase, Building2, Home, GraduationCap, Users } from "lucide-react";

const OCCUPATIONS = [
  { value: 'healthcare', label: 'Healthcare Professional', icon: '🏥' },
  { value: 'education', label: 'Education & Teaching', icon: '📚' },
  { value: 'it_tech', label: 'IT & Technology', icon: '💻' },
  { value: 'business', label: 'Business & Finance', icon: '💼' },
  { value: 'homemaker', label: 'Homemaker', icon: '🏡' },
  { value: 'student', label: 'Student', icon: '🎓' },
  { value: 'retired', label: 'Retired', icon: '🌟' },
  { value: 'creative', label: 'Creative Arts & Media', icon: '🎨' },
  { value: 'service', label: 'Service Industry', icon: '🔧' },
  { value: 'legal', label: 'Legal & Consulting', icon: '⚖️' },
  { value: 'other', label: 'Other', icon: '✨' },
];

const EMPLOYMENT_STATUS = [
  { value: 'employed', label: 'Full-time Employed', icon: Briefcase, description: 'Working full-time' },
  { value: 'self_employed', label: 'Self-Employed', icon: Users, description: 'Freelancer or consultant' },
  { value: 'business_owner', label: 'Business Owner', icon: Building2, description: 'Running own business' },
  { value: 'homemaker', label: 'Homemaker', icon: Home, description: 'Managing household' },
  { value: 'student', label: 'Student', icon: GraduationCap, description: 'Studying' },
  { value: 'retired', label: 'Retired', icon: Users, description: 'Retired professional' },
];

interface OccupationSelectorProps {
  occupation: string;
  employmentStatus: string;
  organizationName: string;
  onOccupationChange: (value: string) => void;
  onEmploymentStatusChange: (value: string) => void;
  onOrganizationNameChange: (value: string) => void;
}

export default function OccupationSelector({
  occupation,
  employmentStatus,
  organizationName,
  onOccupationChange,
  onEmploymentStatusChange,
  onOrganizationNameChange,
}: OccupationSelectorProps) {
  // Extract custom occupation if occupation starts with "other:"
  const isOtherOccupation = occupation === 'other' || (occupation && occupation.startsWith('other:'));
  const customOccupationValue = (occupation && occupation.startsWith('other:')) ? occupation.replace('other:', '') : '';
  
  const [otherOccupation, setOtherOccupation] = useState(customOccupationValue);

  const showOrganizationField = employmentStatus === 'employed' || employmentStatus === 'business_owner';
  const organizationLabel = employmentStatus === 'business_owner' ? 'Business Name' : 'Company Name';

  // Handle occupation selection
  const handleOccupationChange = (value: string) => {
    if (value === 'other') {
      // When "Other" is first selected, keep it as "other"
      onOccupationChange('other');
      setOtherOccupation('');
    } else {
      // For predefined occupations, pass the value directly
      onOccupationChange(value);
      setOtherOccupation('');
    }
  };

  // Handle custom occupation text change
  const handleCustomOccupationChange = (text: string) => {
    setOtherOccupation(text);
    // Always keep "other:" prefix for custom occupations
    if (text.trim()) {
      onOccupationChange(`other:${text}`);
    } else {
      onOccupationChange('other');
    }
  };

  return (
    <div className="space-y-6">
      {/* Occupation Selection */}
      <div className="space-y-2">
        <Label htmlFor="occupation">What do you do?</Label>
        <Select 
          value={isOtherOccupation ? 'other' : occupation} 
          onValueChange={handleOccupationChange}
        >
          <SelectTrigger id="occupation" className="h-12">
            <SelectValue placeholder="Select your occupation" />
          </SelectTrigger>
          <SelectContent>
            {OCCUPATIONS.map((occ) => (
              <SelectItem key={occ.value} value={occ.value}>
                <span className="flex items-center gap-2">
                  <span>{occ.icon}</span>
                  <span>{occ.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Other Occupation Input (if "Other" selected) */}
      {isOtherOccupation && (
        <div className="space-y-2">
          <Label htmlFor="other-occupation">Please specify</Label>
          <Input
            id="other-occupation"
            value={otherOccupation}
            onChange={(e) => handleCustomOccupationChange(e.target.value)}
            placeholder="E.g., Photographer, Chef, Artist"
            className="h-12"
          />
        </div>
      )}

      {/* Employment Status */}
      <div className="space-y-3">
        <Label>Employment Status</Label>
        <RadioGroup value={employmentStatus} onValueChange={onEmploymentStatusChange}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EMPLOYMENT_STATUS.map((status) => {
              const Icon = status.icon;
              return (
                <div
                  key={status.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    employmentStatus === status.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onEmploymentStatusChange(status.value)}
                >
                  <RadioGroupItem value={status.value} id={status.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={status.value} className="cursor-pointer font-medium flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      {status.label}
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">{status.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Organization Name (Conditional) */}
      {showOrganizationField && (
        <div className="space-y-2">
          <Label htmlFor="organization">{organizationLabel} (Optional)</Label>
          <Input
            id="organization"
            value={organizationName}
            onChange={(e) => onOrganizationNameChange(e.target.value)}
            placeholder={employmentStatus === 'business_owner' ? 'Your business name' : 'Where you work'}
            className="h-12"
          />
        </div>
      )}
    </div>
  );
}
