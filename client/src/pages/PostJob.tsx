import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, ArrowLeft, Building } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { TECH_CATEGORIES, ALL_TECH_OPTIONS } from "@/lib/techStack";

interface PostJobProps {
  idToken: string;
}

export default function PostJob({ idToken }: PostJobProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    requiredTechStack: [] as string[],
    experienceLevel: "",
    salaryBudget: "",
    workMode: "",
    jobType: "",
    referralBonus: "",
    description: "",
  });

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const postJobMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const formDataToSend = new FormData();
      formDataToSend.append('jobTitle', data.jobTitle);
      formDataToSend.append('companyName', data.companyName);
      formDataToSend.append('requiredTechStack', JSON.stringify(data.requiredTechStack));
      formDataToSend.append('experienceLevel', data.experienceLevel);
      formDataToSend.append('salaryBudget', data.salaryBudget);
      formDataToSend.append('workMode', data.workMode);
      formDataToSend.append('jobType', data.jobType);
      if (data.referralBonus) {
        formDataToSend.append('referralBonus', data.referralBonus);
      }
      formDataToSend.append('description', data.description);
      
      if (attachmentFile) {
        formDataToSend.append('attachment', attachmentFile);
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formDataToSend,
      });
      if (!response.ok) throw new Error('Failed to post job');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted!",
        description: "Your job has been posted successfully.",
      });
      setTimeout(() => {
        setLocation('/jobs');
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive",
      });
    },
  });

  const toggleTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      requiredTechStack: prev.requiredTechStack.includes(tech)
        ? prev.requiredTechStack.filter(t => t !== tech)
        : [...prev.requiredTechStack, tech]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobTitle || !formData.companyName || !formData.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.requiredTechStack.length === 0) {
      toast({
        title: "Tech Stack Required",
        description: "Please select at least one tech stack",
        variant: "destructive",
      });
      return;
    }

    postJobMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Post a Job</h1>
          </div>
          <p className="text-muted-foreground">
            Hire talented IT professionals from your community
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Senior React Developer"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Tech Corp"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Tech Stack / Skills *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select specific technologies for developer roles, or broader areas for leadership positions
                </p>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {Object.entries(TECH_CATEGORIES).map(([category, techs]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold text-primary mb-2">{category}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {techs.map((tech) => (
                            <div key={tech} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tech-${tech}`}
                                checked={formData.requiredTechStack.includes(tech)}
                                onCheckedChange={() => toggleTech(tech)}
                              />
                              <Label
                                htmlFor={`tech-${tech}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {tech}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                    <SelectTrigger id="experienceLevel">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="2-5">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="5-8">Senior (5-8 years)</SelectItem>
                      <SelectItem value="8-12">Lead (8-12 years)</SelectItem>
                      <SelectItem value="12-15">Principal/Architect (12-15 years)</SelectItem>
                      <SelectItem value="15-20">Executive (15-20 years)</SelectItem>
                      <SelectItem value="20+">Director+ (20+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryBudget">Salary / Budget *</Label>
                  <Input
                    id="salaryBudget"
                    placeholder="e.g., ₹12 LPA or ₹50k/month"
                    value={formData.salaryBudget}
                    onChange={(e) => setFormData({ ...formData, salaryBudget: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workMode">Work Mode *</Label>
                  <Select value={formData.workMode} onValueChange={(value) => setFormData({ ...formData, workMode: value })}>
                    <SelectTrigger id="workMode">
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                    <SelectTrigger id="jobType">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralBonus">Referral Bonus (Optional)</Label>
                <Input
                  id="referralBonus"
                  placeholder="e.g., ₹10,000"
                  value={formData.referralBonus}
                  onChange={(e) => setFormData({ ...formData, referralBonus: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Job Attachment (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Upload job poster image or PDF (max 10MB). Supports: JPG, PNG, PDF
                </p>
                <Input
                  id="attachment"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        toast({
                          title: "File Too Large",
                          description: "Please select a file smaller than 10MB",
                          variant: "destructive",
                        });
                        e.target.value = '';
                        return;
                      }
                      setAttachmentFile(file);
                    }
                  }}
                  className="cursor-pointer"
                />
                {attachmentFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {attachmentFile.name} ({(attachmentFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={postJobMutation.isPending} className="flex-1">
                  <Building className="w-4 h-4 mr-2" />
                  {postJobMutation.isPending ? 'Posting...' : 'Post Job'}
                </Button>
                <Link href="/jobs">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
