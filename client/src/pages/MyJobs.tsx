import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Edit, Trash2, Building, DollarSign, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

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
  status: string;
  createdAt: string;
}

interface JobStats {
  total: number;
  pending: number;
  underReview: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
}

function JobStatsDisplay({ jobId, idToken }: { jobId: string; idToken?: string }) {
  const { data, isLoading } = useQuery<{ stats: JobStats }>({
    queryKey: [`/api/jobs/${jobId}/stats`],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/stats`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!idToken,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        Loading...
      </div>
    );
  }

  if (!data?.stats) {
    return null;
  }

  const { stats } = data;

  return (
    <div className="flex flex-col gap-2 pt-2 border-t">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users className="w-4 h-4" />
        <span>Applicants: {stats.total}</span>
      </div>
      {stats.total > 0 && (
        <div className="flex flex-wrap gap-1 text-xs">
          {stats.pending > 0 && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              Pending: {stats.pending}
            </Badge>
          )}
          {stats.underReview > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Review: {stats.underReview}
            </Badge>
          )}
          {stats.shortlisted > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              Shortlisted: {stats.shortlisted}
            </Badge>
          )}
          {stats.accepted > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Accepted: {stats.accepted}
            </Badge>
          )}
          {stats.rejected > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              Rejected: {stats.rejected}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

interface MyJobsProps {
  userId?: string;
  idToken?: string;
}

export default function MyJobs({ userId, idToken }: MyJobsProps = {}) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    jobTitle: "",
    companyName: "",
    requiredTechStack: "",
    experienceLevel: "",
    salaryBudget: "",
    workMode: "hybrid",
    jobType: "full-time",
    referralBonus: "",
    description: "",
  });

  const { data, isLoading } = useQuery<{ jobs: Job[] }>({
    queryKey: ['/api/jobs/my-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/my-jobs', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
    enabled: !!idToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete job');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Deleted",
        description: "Your job posting has been removed.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setEditForm({
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      requiredTechStack: job.requiredTechStack.join(", "),
      experienceLevel: job.experienceLevel,
      salaryBudget: job.salaryBudget,
      workMode: job.workMode,
      jobType: job.jobType,
      referralBonus: job.referralBonus || "",
      description: job.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedJob) {
      deleteMutation.mutate(selectedJob.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">My Job Postings</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/post-job">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your job postings and view applications
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your jobs...</p>
          </div>
        ) : data?.jobs && data.jobs.length > 0 ? (
          <div className="space-y-4">
            {data.jobs.map((job) => (
              <Card key={job.id} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex gap-4 justify-between">
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
                          <Badge variant="secondary">{job.jobType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Badge>
                          <Badge variant="outline">{job.workMode.charAt(0).toUpperCase() + job.workMode.slice(1)}</Badge>
                          <Badge className={job.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
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
                        <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 mb-2">
                          Referral Bonus: {job.referralBonus}
                        </Badge>
                      )}
                      <p className="text-sm line-clamp-2 mb-3">
                        {job.description}
                      </p>
                      <JobStatsDisplay jobId={job.id} idToken={idToken} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/jobs/${job.id}/applicants`}>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View Applicants
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(job)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Jobs Posted Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start posting job opportunities for your community
            </p>
            <Link href="/post-job">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{selectedJob?.jobTitle}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Posting (Coming Soon)</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Edit functionality will be available soon. For now, you can delete and create a new posting if you need to make changes.
          </p>
          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
