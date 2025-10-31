import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Briefcase, MapPin, DollarSign, Clock, Building, Plus, Send, CheckCircle2, Paperclip, FileText, Image } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ApplyJobModal from "@/components/ApplyJobModal";

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
  company: string;
}

interface Job {
  id: string;
  posterId: string;
  jobTitle: string;
  companyName: string;
  requiredTechStack: string[];
  experienceLevel: string;
  salaryBudget: string;
  workMode: string;
  jobType: string;
  referralBonus?: string | null;
  description: string;
  attachmentUrl?: string | null;
  createdAt: string;
  poster: User;
}

interface JobBoardProps {
  userId?: string;
  idToken?: string;
}

export default function JobBoard({ userId, idToken }: JobBoardProps = {}) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ jobs: Job[] }>({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  const { data: applicationsData } = useQuery<{ applications: Array<{ jobId: string }> }>({
    queryKey: ['/api/jobs/my-applications'],
    queryFn: async () => {
      if (!idToken) return { applications: [] };
      const response = await fetch('/api/jobs/my-applications', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { applications: [] };
      return response.json();
    },
    enabled: !!idToken,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasApplied = (jobId: string) => {
    return applicationsData?.applications.some(app => app.jobId === jobId) || false;
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsDialogOpen(true);
  };

  const handleApplyClick = (job: Job) => {
    if (!userId || !idToken) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for jobs",
        variant: "destructive",
      });
      return;
    }

    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const getWorkModeIcon = (mode: string) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  const getJobTypeIcon = (type: string) => {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold">Job Board</h1>
            </div>
            <div className="flex gap-2">
              {userId && idToken && (
                <>
                  <Link href="/my-jobs">
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                      <Briefcase className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">My Jobs</span>
                    </Button>
                  </Link>
                  <Link href="/post-job">
                    <Button size="sm" className="flex-1 md:flex-none">
                      <Plus className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Post Job</span>
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Discover opportunities from your tech community
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : data?.jobs && data.jobs.length > 0 ? (
          <div className="space-y-4">
            {data.jobs.map((job) => {
              const isOwnJob = job.posterId === userId;
              const alreadyApplied = hasApplied(job.id);
              
              return (
              <Card
                key={job.id}
                className="hover-elevate"
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={job.poster.profilePhotoUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(job.poster.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
                          <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Building className="w-3 h-3" />
                            {job.companyName}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{getJobTypeIcon(job.jobType)}</Badge>
                          <Badge variant="outline">{getWorkModeIcon(job.workMode)}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.salaryBudget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.experienceLevel} years
                        </span>
                        <span className="flex items-center gap-1">
                          Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.requiredTechStack.slice(0, 6).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs font-mono">
                            {tech}
                          </Badge>
                        ))}
                        {job.requiredTechStack.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requiredTechStack.length - 6} more
                          </Badge>
                        )}
                      </div>
                      {job.referralBonus && (
                        <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                          Referral Bonus: {job.referralBonus}
                        </Badge>
                      )}
                      {job.attachmentUrl && (
                        <div className="mt-3">
                          <a
                            href={job.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            {job.attachmentUrl.endsWith('.pdf') ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <Image className="w-4 h-4" />
                            )}
                            <span>
                              {job.attachmentUrl.endsWith('.pdf') ? 'View PDF' : 'View Image'}
                            </span>
                          </a>
                        </div>
                      )}
                      <p className="text-sm mt-2 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(job);
                          }}
                        >
                          View Details
                        </Button>
                        {userId && idToken && (
                          <>
                            {isOwnJob ? (
                              <Button variant="outline" size="sm" disabled>
                                Your Job
                              </Button>
                            ) : alreadyApplied ? (
                              <Button variant="outline" size="sm" disabled>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Applied
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyClick(job);
                                }}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Apply Now
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Jobs Posted Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to post a job opportunity
            </p>
            {userId && idToken && (
              <Link href="/post-job">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.jobTitle}</DialogTitle>
            <DialogDescription>{selectedJob?.companyName}</DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedJob.poster.profilePhotoUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedJob.poster.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedJob.poster.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedJob.poster.company}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{getJobTypeIcon(selectedJob.jobType)}</Badge>
                <Badge variant="outline">{getWorkModeIcon(selectedJob.workMode)}</Badge>
                <Badge>{selectedJob.experienceLevel} years experience</Badge>
                <Badge>{selectedJob.salaryBudget}</Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Required Tech Stack</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedJob.requiredTechStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="font-mono">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedJob.referralBonus && (
                <div>
                  <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                    Referral Bonus: {selectedJob.referralBonus}
                  </Badge>
                </div>
              )}

              {selectedJob.attachmentUrl && (
                <div>
                  <h4 className="font-semibold mb-2">Job Attachment</h4>
                  <a
                    href={selectedJob.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent"
                  >
                    {selectedJob.attachmentUrl.endsWith('.pdf') ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Image className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">
                      {selectedJob.attachmentUrl.endsWith('.pdf') ? 'View PDF Document' : 'View Image'}
                    </span>
                  </a>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              <DialogFooter>
                {userId && idToken && selectedJob.posterId !== userId && !hasApplied(selectedJob.id) && (
                  <Button onClick={() => {
                    setIsDetailsDialogOpen(false);
                    handleApplyClick(selectedJob);
                  }}>
                    <Send className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                )}
                {userId && hasApplied(selectedJob.id) && (
                  <Button disabled variant="outline">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Already Applied
                  </Button>
                )}
                {selectedJob.posterId === userId && (
                  <div className="bg-muted p-3 rounded-lg text-center flex-1">
                    <p className="text-sm text-muted-foreground">
                      This is your job posting
                    </p>
                  </div>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedJob && idToken && (
        <ApplyJobModal
          jobId={selectedJob.id}
          jobTitle={selectedJob.jobTitle}
          companyName={selectedJob.companyName}
          idToken={idToken}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </div>
  );
}
