import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Users } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Idea {
  id: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  payStructure: string;
}

interface PostIdeaModalProps {
  idToken?: string;
  isOpen: boolean;
  onClose: () => void;
  editIdea?: Idea;
}

const AVAILABLE_ROLES = [
  'Frontend Dev',
  'Backend Dev',
  'Full Stack Dev',
  'ML Engineer',
  'Designer',
  'Product Manager',
  'Business Dev',
];

export default function PostIdeaModal({
  idToken,
  isOpen,
  onClose,
  editIdea,
}: PostIdeaModalProps) {
  const { toast } = useToast();
  const isEditMode = !!editIdea;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [payStructure, setPayStructure] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    roles?: string;
    pay?: string;
  }>({});

  useEffect(() => {
    if (editIdea && isOpen) {
      setTitle(editIdea.title);
      setDescription(editIdea.description);
      setSelectedRoles(editIdea.rolesNeeded);
      setPayStructure(editIdea.payStructure);
    } else if (!isOpen) {
      setTitle("");
      setDescription("");
      setSelectedRoles([]);
      setPayStructure("");
      setErrors({});
    }
  }, [editIdea, isOpen]);

  const postMutation = useMutation({
    mutationFn: async () => {
      const url = isEditMode ? `/api/ideas/${editIdea.id}` : '/api/ideas';
      const method = isEditMode ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          rolesNeeded: selectedRoles,
          payStructure,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'post'} idea`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: isEditMode ? "Idea Updated!" : "Idea Posted!",
        description: isEditMode 
          ? "Your idea has been updated successfully." 
          : "Your idea has been submitted for approval. You'll be notified once it's live.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ideas/my-ideas'] });
      setTitle("");
      setDescription("");
      setSelectedRoles([]);
      setPayStructure("");
      setErrors({});
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: isEditMode ? "Failed to Update Idea" : "Failed to Post Idea",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'post'} idea. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
    if (errors.roles) {
      setErrors({ ...errors, roles: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 5) {
      newErrors.title = "Title should be at least 5 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 200) {
      newErrors.description = `Description should be at least 200 characters (currently ${description.trim().length})`;
    }

    if (selectedRoles.length === 0) {
      newErrors.roles = "Select at least one role";
    }

    if (!payStructure.trim()) {
      newErrors.pay = "Pay structure is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    postMutation.mutate();
  };

  const handleClose = () => {
    if (postMutation.isPending) return;
    setTitle("");
    setDescription("");
    setSelectedRoles([]);
    setPayStructure("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-5 h-5 text-primary" />
            <DialogTitle>{isEditMode ? 'Edit Your Idea' : 'Post Your Startup Idea'}</DialogTitle>
          </div>
          <DialogDescription>
            {isEditMode 
              ? 'Update your idea details below' 
              : 'Share your idea with the community and attract potential co-founders'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Idea Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="e.g., AI Attendance for Housing Societies"
              disabled={postMutation.isPending}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              placeholder="Describe your idea in detail. What problem does it solve? Who is the target audience? What makes it unique?"
              className="min-h-[200px]"
              disabled={postMutation.isPending}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{description.length} / 200 characters minimum</span>
              {description.length < 200 && description.length > 0 && (
                <span className="text-destructive">
                  {200 - description.length} more needed
                </span>
              )}
            </div>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Roles Needed <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${selectedRoles.includes(role)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }
                  `}
                  disabled={postMutation.isPending}
                >
                  {role}
                </button>
              ))}
            </div>
            {selectedRoles.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedRoles.join(', ')}
              </p>
            )}
            {errors.roles && (
              <p className="text-sm text-destructive">{errors.roles}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payStructure">
              Equity / Pay Structure <span className="text-destructive">*</span>
            </Label>
            <Input
              id="payStructure"
              value={payStructure}
              onChange={(e) => {
                setPayStructure(e.target.value);
                if (errors.pay) setErrors({ ...errors, pay: undefined });
              }}
              placeholder="e.g., Equal equity split, Sweat equity, ₹50K/month + 5% equity"
              disabled={postMutation.isPending}
            />
            {errors.pay && (
              <p className="text-sm text-destructive">{errors.pay}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">After Posting</p>
                <p className="text-blue-700">
                  Your idea will be reviewed for approval. Once approved, community members can express interest and connect with you.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={postMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={postMutation.isPending}>
              {postMutation.isPending 
                ? (isEditMode ? "Updating..." : "Posting...") 
                : (isEditMode ? "Update Idea" : "Post Idea")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
