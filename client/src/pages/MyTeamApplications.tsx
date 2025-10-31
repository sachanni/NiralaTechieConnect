import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileText, ArrowLeft, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Idea {
  id: string;
  title: string;
  posterId: string;
}

interface Application {
  id: string;
  ideaId: string;
  applicantId: string;
  roleAppliedFor: string;
  message: string;
  status: string;
  createdAt: string;
  idea: Idea;
}

interface MyTeamApplicationsProps {
  idToken?: string;
}

export default function MyTeamApplications({ idToken }: MyTeamApplicationsProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ applications: Application[] }>({
    queryKey: ["/api/team-applications/my-applications"],
    queryFn: async () => {
      const response = await fetch("/api/team-applications/my-applications", {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) return { applications: [] };
      return response.json();
    },
    enabled: !!idToken,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await fetch(`/api/team-applications/${applicationId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${idToken}` },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to withdraw application");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-applications/my-applications"] });
      setWithdrawId(null);
      toast({
        title: "Application withdrawn",
        description: "Your team application has been withdrawn successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw application",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/ideas">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Idea Wall
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">My Team Applications</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Track your applications to join startup teams
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !data || data.applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't applied to join any teams yet.
              </p>
              <Link href="/ideas">
                <Button>Browse Ideas</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data.applications.map((application) => (
              <Card key={application.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        <Link href={`/ideas/${application.ideaId}`} className="hover:underline">
                          {application.idea.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{application.roleAppliedFor}</Badge>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                    </div>
                    {application.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWithdrawId(application.id)}
                        disabled={withdrawMutation.isPending}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Your Message:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.message}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!withdrawId} onOpenChange={(open) => !open && setWithdrawId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => withdrawId && withdrawMutation.mutate(withdrawId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Withdraw Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
