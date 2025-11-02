import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

// Comprehensive skill database mapped to service categories
const SKILLS_BY_CATEGORY = {
  healthcare: [
    { name: 'General Medicine', category: 'Healthcare' },
    { name: 'Pediatrics', category: 'Healthcare' },
    { name: 'Dermatology', category: 'Healthcare' },
    { name: 'Physiotherapy', category: 'Healthcare' },
    { name: 'Yoga Instruction', category: 'Healthcare' },
    { name: 'Fitness Training', category: 'Healthcare' },
    { name: 'Nutrition Counseling', category: 'Healthcare' },
  ],
  food: [
    { name: 'Home Cooking', category: 'Food' },
    { name: 'Baking', category: 'Food' },
    { name: 'Catering', category: 'Food' },
    { name: 'Diet Planning', category: 'Food' },
    { name: 'Regional Cuisine', category: 'Food' },
    { name: 'Healthy Meal Prep', category: 'Food' },
  ],
  education: [
    { name: 'Math Tutoring', category: 'Education' },
    { name: 'Science Tutoring', category: 'Education' },
    { name: 'Language Teaching', category: 'Education' },
    { name: 'Music Lessons', category: 'Education' },
    { name: 'Dance Teaching', category: 'Education' },
    { name: 'Art Classes', category: 'Education' },
  ],
  beauty: [
    { name: 'Makeup Artistry', category: 'Beauty' },
    { name: 'Mehendi Application', category: 'Beauty' },
    { name: 'Hairstyling', category: 'Beauty' },
    { name: 'Skincare', category: 'Beauty' },
    { name: 'Tailoring', category: 'Beauty' },
  ],
  tech: [
    { name: 'React', category: 'Tech - Frontend' },
    { name: 'Angular', category: 'Tech - Frontend' },
    { name: 'Vue.js', category: 'Tech - Frontend' },
    { name: 'Node.js', category: 'Tech - Backend' },
    { name: 'Python', category: 'Tech - Backend' },
    { name: 'Java', category: 'Tech - Backend' },
    { name: 'AWS', category: 'Tech - Cloud' },
    { name: 'Docker', category: 'Tech - DevOps' },
    { name: 'PostgreSQL', category: 'Tech - Database' },
  ],
  professional: [
    { name: 'Career Counseling', category: 'Professional' },
    { name: 'Interview Coaching', category: 'Professional' },
    { name: 'Resume Writing', category: 'Professional' },
    { name: 'Business Consulting', category: 'Professional' },
  ],
  childcare: [
    { name: 'Babysitting', category: 'Childcare' },
    { name: 'Child Development', category: 'Childcare' },
    { name: 'Homework Help', category: 'Childcare' },
    { name: 'Kids Activities', category: 'Childcare' },
  ],
  events: [
    { name: 'Event Planning', category: 'Events' },
    { name: 'Decoration', category: 'Events' },
    { name: 'Photography', category: 'Events' },
    { name: 'Videography', category: 'Events' },
  ],
};

interface MultiCategorySkillSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  occupation?: string;
  certifications?: string;
  onCertificationsChange?: (value: string) => void;
}

export default function MultiCategorySkillSelector({
  selected,
  onChange,
  occupation = '',
  certifications = '',
  onCertificationsChange,
}: MultiCategorySkillSelectorProps) {
  const [search, setSearch] = useState('');
  const [customSkill, setCustomSkill] = useState('');

  // Determine which skills to show based on occupation
  // Make it inclusive - show ALL skill categories for everyone
  const getRelevantSkills = () => {
    const allSkills: typeof SKILLS_BY_CATEGORY.healthcare = [];
    
    // Show all skill categories to everyone - truly inclusive approach
    // This allows homemakers to offer catering, retirees to teach music, 
    // students to offer tutoring, business owners to offer event planning, etc.
    
    allSkills.push(...SKILLS_BY_CATEGORY.healthcare);
    allSkills.push(...SKILLS_BY_CATEGORY.food);
    allSkills.push(...SKILLS_BY_CATEGORY.education);
    allSkills.push(...SKILLS_BY_CATEGORY.beauty);
    allSkills.push(...SKILLS_BY_CATEGORY.tech);
    allSkills.push(...SKILLS_BY_CATEGORY.professional);
    allSkills.push(...SKILLS_BY_CATEGORY.childcare);
    allSkills.push(...SKILLS_BY_CATEGORY.events);
    
    return allSkills;
  };

  const availableSkills = getRelevantSkills();
  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group skills by category for better display
  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof availableSkills>);

  const toggleSkill = (skillName: string) => {
    if (selected.includes(skillName)) {
      onChange(selected.filter(s => s !== skillName));
    } else {
      onChange([...selected, skillName]);
    }
  };

  const removeSkill = (skillName: string) => {
    onChange(selected.filter(s => s !== skillName));
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selected.includes(customSkill.trim())) {
      onChange([...selected, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-purple-900 mb-1">
              Select your skills and expertise
            </p>
            <p className="text-xs text-purple-700">
              Choose from suggested skills or add your own. These help neighbors find the right services.
            </p>
          </div>
        </div>
      </Card>

      {/* Search Bar */}
      <div className="space-y-2">
        <Label htmlFor="skill-search">Search Skills</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="skill-search"
            type="text"
            placeholder="Search for skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Selected Skills */}
      {selected.length > 0 && (
        <div className="space-y-2">
          <Label>Your Selected Skills ({selected.length})</Label>
          <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50">
            {selected.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="h-8 px-3 gap-1 hover-elevate"
              >
                <span className="text-xs">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Skills by Category */}
      <div className="space-y-4">
        <Label>Available Skills</Label>
        <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill.name}
                    variant={selected.includes(skill.name) ? "default" : "outline"}
                    className="h-8 px-3 cursor-pointer hover-elevate active-elevate-2"
                    onClick={() => toggleSkill(skill.name)}
                  >
                    <span className="text-xs">{skill.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Skill */}
      <div className="space-y-2">
        <Label htmlFor="custom-skill">Add Your Own Skill</Label>
        <div className="flex gap-2">
          <Input
            id="custom-skill"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
            placeholder="E.g., Photography, Cooking, etc."
            className="h-10"
          />
          <button
            onClick={addCustomSkill}
            className="px-4 h-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Certifications/Credentials */}
      {onCertificationsChange && (
        <div className="space-y-2">
          <Label htmlFor="certifications">Certifications & Credentials (Optional)</Label>
          <Textarea
            id="certifications"
            value={certifications}
            onChange={(e) => onCertificationsChange(e.target.value)}
            placeholder="E.g., 'MBBS, MD' or 'Certified Yoga Instructor' or 'Professional Chef Certificate'"
            className="min-h-20 resize-none"
            maxLength={200}
          />
          <p className="text-xs text-gray-500">{certifications.length}/200 characters</p>
        </div>
      )}
    </div>
  );
}
