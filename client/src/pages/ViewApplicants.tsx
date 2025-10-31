import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Building, FileText, Calendar, User, Download, Mail } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface User {
  id: string;
  fullName: string;
  email: string;
  company: string;
  techStack: string[];
  yearsOfExperience: number;
  profilePhotoUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
}

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  resumeUrl: string;
  coverLetter: string;
  status: string;
  createdAt: string;
  applicant: User;
}

interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  requiredTechStack: string[];
  experienceLevel: string;
  salaryBudget: string;
  workMode: string;
  jobType: string;
  description: string;
  createdAt: string;
}

interface ViewApplicantsProps {
  idToken?: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-700' },
  { value: 'under-review', label: 'Under Review', color: 'bg-blue-500/10 text-blue-700' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-500/10 text-purple-700' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-500/10 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500/10 text-red-700' },
];

export default function ViewApplicants({ idToken }: ViewApplicantsProps = {}) {
  const [, params] = useRoute("/jobs/:id/applicants");
  const jobId = params?.id;
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const { data: jobData, isLoading: jobLoading } = useQuery<{ job: Job }>({
    queryKey: [`/api/jobs/${jobId}`],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch job');
      return response.json();
    },
    enabled: !!jobId,
  });

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery<{ applications: Application[] }>({
    queryKey: [`/api/jobs/${jobId}/applicants`],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/applicants`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch applications');
      }
      return response.json();
    },
    enabled: !!jobId && !!idToken,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/applicants`] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/stats`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
    return (
      <Badge className={`${option.color} hover:${option.color}`}>
        {option.label}
      </Badge>
    );
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateStatusMutation.mutate({ applicationId, status: newStatus });
  };

  const isLoading = jobLoading || applicationsLoading;
  const applications = applicationsData?.applications || [];
  const job = jobData?.job;

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Applicants</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/my-jobs" className="hidden md:block">
                <Button variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  My Jobs
                </Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          {job && (
            <div>
              <h2 className="text-lg font-semibold mb-1">{job.jobTitle}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Building className="w-4 h-4" />
                {job.companyName}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading applicants...</p>
          </div>
        ) : applications.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{applications.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              {STATUS_OPTIONS.map(status => (
                <Card key={status.value} className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{statusCounts[status.value] || 0}</div>
                    <div className="text-xs text-muted-foreground">{status.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={application.applicant.profilePhotoUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(application.applicant.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{application.applicant.fullName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {application.applicant.company} • {application.applicant.yearsOfExperience} years exp
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(application.status)}
                            <p className="text-xs text-muted-foreground text-right">
                              Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {application.applicant.techStack.slice(0, 6).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs font-mono">
                              {tech}
                            </Badge>
                          ))}
                          {application.applicant.techStack.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{application.applicant.techStack.length - 6} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                          >
                            View Full Application
                          </Button>
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Resume
                            </Button>
                          </a>
                          <Select
                            value={application.status}
                            onValueChange={(value) => handleStatusChange(application.id, value)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-[180px] h-9">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-4">
              Applications will appear here as candidates apply to this job posting
            </p>
            <Link href="/my-jobs">
              <Button variant="outline">
                Back to My Jobs
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedApplication?.applicant.fullName}</DialogTitle>
            <DialogDescription>
              Application for {job?.jobTitle}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedApplication.applicant.profilePhotoUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(selectedApplication.applicant.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedApplication.applicant.fullName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedApplication.applicant.company} • {selectedApplication.applicant.yearsOfExperience} years experience
                  </p>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm">Contact Information</h4>
                <p className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {selectedApplication.applicant.email}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm">Tech Stack</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedApplication.applicant.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="font-mono">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {(selectedApplication.applicant.linkedinUrl || selectedApplication.applicant.githubUrl) && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Links</h4>
                  <div className="flex flex-col gap-2">
                    {selectedApplication.applicant.linkedinUrl && (
                      <a
                        href={selectedApplication.applicant.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                    {selectedApplication.applicant.githubUrl && (
                      <a
                        href={selectedApplication.applicant.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        GitHub Profile
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Application Details</h4>
                
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Submitted on {format(new Date(selectedApplication.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
                  </p>
                </div>

                <div className="mb-4">
                  <h5 className="text-sm font-semibold mb-2">Resume</h5>
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Resume
                    </Button>
                  </a>
                </div>

                <div>
                  <h5 className="text-sm font-semibold mb-2">Cover Letter</h5>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 text-sm">Update Status</h4>
                <Select
                  value={selectedApplication.status}
                  onValueChange={(value) => {
                    handleStatusChange(selectedApplication.id, value);
                    setSelectedApplication({ ...selectedApplication, status: value });
                  }}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
