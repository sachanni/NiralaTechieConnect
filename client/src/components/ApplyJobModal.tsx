import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface ApplyJobModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  idToken: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyJobModal({
  jobId,
  jobTitle,
  companyName,
  idToken,
  isOpen,
  onClose,
  onSuccess,
}: ApplyJobModalProps) {
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ coverLetter?: string; resume?: string }>({});

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!resumeFile) {
        throw new Error("Please upload your resume");
      }

      if (!coverLetter.trim()) {
        throw new Error("Please write a cover letter");
      }

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('coverLetter', coverLetter);

      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply to job');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the employer. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/my-applications'] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/stats`] });
      setCoverLetter("");
      setResumeFile(null);
      setErrors({});
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, resume: 'Only PDF, DOC, and DOCX files are allowed' });
      return;
    }

    if (file.size > maxSize) {
      setErrors({ ...errors, resume: 'File size must be less than 5MB' });
      return;
    }

    setResumeFile(file);
    setErrors({ ...errors, resume: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { coverLetter?: string; resume?: string } = {};

    if (!resumeFile) {
      newErrors.resume = "Resume is required";
    }

    if (!coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required";
    } else if (coverLetter.trim().length < 50) {
      newErrors.coverLetter = "Cover letter should be at least 50 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    applyMutation.mutate();
  };

  const handleClose = () => {
    if (applyMutation.isPending) return;
    setCoverLetter("");
    setResumeFile(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>
            at {companyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume">
              Resume/CV <span className="text-destructive">*</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              {resumeFile ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{resumeFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(resumeFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setResumeFile(null);
                      setErrors({ ...errors, resume: undefined });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="resume" className="cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Upload your resume</p>
                  <p className="text-xs text-muted-foreground mb-2">PDF, DOC, DOCX (max 5MB)</p>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm">
                    Choose File
                  </Button>
                </label>
              )}
            </div>
            {errors.resume && (
              <p className="text-sm text-destructive">{errors.resume}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">
              Cover Letter <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => {
                setCoverLetter(e.target.value);
                if (e.target.value.trim()) {
                  setErrors({ ...errors, coverLetter: undefined });
                }
              }}
              placeholder="Tell the employer why you're a great fit for this position..."
              className="min-h-[200px]"
              disabled={applyMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              {coverLetter.length} characters (minimum 50)
            </p>
            {errors.coverLetter && (
              <p className="text-sm text-destructive">{errors.coverLetter}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={applyMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
