import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import SkillsMultiSelect from "./SkillsMultiSelect";

interface EditSkillsModalProps {
  userId: string;
  idToken: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditSkillsModal({
  userId,
  idToken,
  isOpen,
  onClose,
}: EditSkillsModalProps) {
  const { toast } = useToast();
  const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);

  const { data: userData } = useQuery<{ skillsToTeach: string[]; skillsToLearn: string[] }>({
    queryKey: [`/api/users/${userId}/skills`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
    enabled: !!idToken && !!userId && isOpen,
  });

  useEffect(() => {
    if (userData && isOpen) {
      setSkillsToTeach(userData.skillsToTeach || []);
      setSkillsToLearn(userData.skillsToLearn || []);
    }
  }, [userData, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/users/skills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          skillsToTeach,
          skillsToLearn,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update skills');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Skills Updated!",
        description: "Your skill preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      queryClient.invalidateQueries({ queryKey: ['/api/skill-swap/matches'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Skills",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const duplicates = skillsToTeach.filter(skill => skillsToLearn.includes(skill));
    if (duplicates.length > 0) {
      toast({
        title: "Duplicate Skills Found",
        description: `You cannot add the same skill to both sections: ${duplicates.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    updateMutation.mutate();
  };

  const handleClose = () => {
    if (updateMutation.isPending) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-primary" />
            <DialogTitle>Edit Your Skills</DialogTitle>
          </div>
          <DialogDescription>
            Update what you can teach and what you want to learn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SkillsMultiSelect
            value={skillsToTeach}
            onChange={setSkillsToTeach}
            label="I Can Teach"
            disabledSkills={skillsToLearn}
          />

          <SkillsMultiSelect
            value={skillsToLearn}
            onChange={setSkillsToLearn}
            label="I Want to Learn"
            disabledSkills={skillsToTeach}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
