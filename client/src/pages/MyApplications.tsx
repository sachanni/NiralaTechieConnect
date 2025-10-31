import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Building, DollarSign, Clock, FileText, Calendar, Send, CheckCircle2, Search, Filter, ArrowUpDown, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  requiredTechStack: string[];
  experienceLevel: string;
  salaryBudget: string;
  workMode: string;
  jobType: string;
  referralBonus?: string | null;
  description: string;
  createdAt: string;
}

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  resumeUrl: string;
  coverLetter: string;
  status: string;
  createdAt: string;
  job: Job;
}

interface MyApplicationsProps {
  userId?: string;
  idToken?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  'pending': { bg: 'bg-yellow-500/10', text: 'text-yellow-700', label: 'Pending' },
  'under-review': { bg: 'bg-blue-500/10', text: 'text-blue-700', label: 'Under Review' },
  'shortlisted': { bg: 'bg-purple-500/10', text: 'text-purple-700', label: 'Shortlisted' },
  'accepted': { bg: 'bg-green-500/10', text: 'text-green-700', label: 'Accepted' },
  'rejected': { bg: 'bg-red-500/10', text: 'text-red-700', label: 'Rejected' },
};

export default function MyApplications({ userId, idToken }: MyApplicationsProps = {}) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ applications: Application[] }>({
    queryKey: ['/api/jobs/my-applications'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/my-applications', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    },
    enabled: !!idToken,
  });

  const filteredApplications = useMemo(() => {
    if (!data?.applications) return [];

    let filtered = [...data.applications];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.job.jobTitle.toLowerCase().includes(query) ||
        app.job.companyName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [data?.applications, searchQuery, statusFilter, sortOrder]);

  const getStatusBadge = (status: string) => {
    const config = STATUS_COLORS[status] || STATUS_COLORS['pending'];
    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        {config.label}
      </Badge>
    );
  };

  const getWorkModeIcon = (mode: string) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  const getJobTypeIcon = (type: string) => {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const withdrawMutation = useMutation({
    mutationFn: async ({ applicationId, jobId }: { applicationId: string; jobId: string }) => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to withdraw application');
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      toast({
        title: "Application Withdrawn",
        description: "Your application has been withdrawn successfully.",
      });
      setIsWithdrawDialogOpen(false);
      setApplicationToWithdraw(null);
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${variables.jobId}/stats`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw application",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = (application: Application) => {
    setApplicationToWithdraw(application);
    setIsWithdrawDialogOpen(true);
  };

  const confirmWithdraw = () => {
    if (applicationToWithdraw) {
      withdrawMutation.mutate({ 
        applicationId: applicationToWithdraw.id, 
        jobId: applicationToWithdraw.jobId 
      });
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">My Applications</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/jobs" className="hidden md:block">
                <Button variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground">
            Track your job applications and their status
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {data?.applications && data.applications.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job title or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
                  <SelectTrigger className="w-[150px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {filteredApplications.length !== data.applications.length && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredApplications.length} of {data.applications.length} applications
              </p>
            )}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your applications...</p>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex gap-4 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{application.job.jobTitle}</h3>
                          <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Building className="w-3 h-3" />
                            {application.job.companyName}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(application.status)}
                          <Badge variant="secondary">{getJobTypeIcon(application.job.jobType)}</Badge>
                          <Badge variant="outline">{getWorkModeIcon(application.job.workMode)}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {application.job.salaryBudget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {application.job.experienceLevel} years
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {application.job.requiredTechStack.slice(0, 6).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs font-mono">
                            {tech}
                          </Badge>
                        ))}
                        {application.job.requiredTechStack.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.job.requiredTechStack.length - 6} more
                          </Badge>
                        )}
                      </div>
                      {application.job.referralBonus && (
                        <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 mb-2">
                          Referral Bonus: {application.job.referralBonus}
                        </Badge>
                      )}
                      <p className="text-sm line-clamp-2 mt-2">
                        {application.job.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(application)}
                      >
                        View Details
                      </Button>
                      {application.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdraw(application)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.applications && data.applications.length > 0 ? (
          <Card className="p-12 text-center">
            <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Matching Applications</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start applying to job opportunities from your community
            </p>
            <Link href="/jobs">
              <Button>
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Job Board
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedApplication?.job.jobTitle}</DialogTitle>
            <DialogDescription>{selectedApplication?.job.companyName}</DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Application Status:</span>
                {getStatusBadge(selectedApplication.status)}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Application Submitted</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedApplication.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Job Details</h4>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{getJobTypeIcon(selectedApplication.job.jobType)}</Badge>
                  <Badge variant="outline">{getWorkModeIcon(selectedApplication.job.workMode)}</Badge>
                  <Badge>{selectedApplication.job.experienceLevel} years experience</Badge>
                  <Badge>{selectedApplication.job.salaryBudget}</Badge>
                </div>

                <div className="mb-4">
                  <h5 className="text-sm font-semibold mb-2">Required Tech Stack</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedApplication.job.requiredTechStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="font-mono">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedApplication.job.referralBonus && (
                  <div className="mb-4">
                    <Badge className="bg-green-500/10 text-green-700">
                      Referral Bonus: {selectedApplication.job.referralBonus}
                    </Badge>
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-semibold mb-2">Description</h5>
                  <p className="text-sm whitespace-pre-wrap">{selectedApplication.job.description}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Your Application</h4>
                
                <div className="mb-4">
                  <h5 className="text-sm font-semibold mb-2">Resume</h5>
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </a>
                </div>

                <div>
                  <h5 className="text-sm font-semibold mb-2">Cover Letter</h5>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
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

      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Application?</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your application for {applicationToWithdraw?.job.jobTitle} at {applicationToWithdraw?.job.companyName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsWithdrawDialogOpen(false)}
              disabled={withdrawMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmWithdraw}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
