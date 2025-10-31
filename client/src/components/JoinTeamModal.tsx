import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ROLE_OPTIONS = [
  "Frontend Dev",
  "Backend Dev",
  "Full Stack Dev",
  "ML Engineer",
  "Designer",
  "Product Manager",
  "Business Dev",
];

interface JoinTeamModalProps {
  ideaId: string;
  ideaTitle: string;
  rolesNeeded: string[];
  idToken?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function JoinTeamModal({ ideaId, ideaTitle, rolesNeeded, idToken, variant = "default", size = "default" }: JoinTeamModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [message, setMessage] = useState("");

  const { data: applicationStatus } = useQuery<{ hasApplied: boolean }>({
    queryKey: [`/api/ideas/${ideaId}/has-applied-team`],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/has-applied-team`, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) return { hasApplied: false };
      return response.json();
    },
    enabled: isOpen && !!idToken,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/apply-team`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${idToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          roleAppliedFor: selectedRole,
          message: message.trim(),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to apply");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/has-applied-team`] });
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/team-stats`] });
      queryClient.invalidateQueries({ queryKey: ["/api/team-applications/my-applications"] });
      setIsOpen(false);
      setSelectedRole("");
      setMessage("");
      toast({
        title: "Application submitted!",
        description: "The idea owner will review your application soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!selectedRole || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a role and write a message explaining why you'd be a good fit.",
        variant: "destructive",
      });
      return;
    }
    applyMutation.mutate();
  };

  const hasApplied = applicationStatus?.hasApplied || false;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2" disabled={hasApplied}>
          <Users className="w-4 h-4" />
          {hasApplied ? "Already Applied" : "Join Team"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to Join Team</DialogTitle>
          <DialogDescription>
            Submit your application to join "{ideaTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Roles Needed</Label>
            <div className="flex flex-wrap gap-2">
              {rolesNeeded.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Select Your Role *</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                    {rolesNeeded.includes(role) && " (Needed)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the role you'd like to contribute in
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Why You'd Be a Great Fit *</Label>
            <Textarea
              id="message"
              placeholder="Tell the idea owner about your experience, skills, and why you're excited about this idea..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500 characters
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={applyMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={applyMutation.isPending}>
            {applyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
