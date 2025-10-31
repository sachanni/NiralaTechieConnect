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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, X, Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

interface EditProfileModalProps {
  userId: string;
  idToken: string;
  isOpen: boolean;
  onClose: () => void;
}

const specialtyOptions = [
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile Development",
  "DevOps/SRE",
  "Cloud Architecture",
  "Data Engineering",
  "Machine Learning/AI",
  "System Design",
  "Security",
  "Database Design",
  "API Design",
  "Microservices",
  "Performance Optimization",
  "Team Leadership",
  "Product Management",
  "Technical Writing"
];

export default function EditProfileModal({
  userId,
  idToken,
  isOpen,
  onClose,
}: EditProfileModalProps) {
  const { toast } = useToast();
  const [companyHistory, setCompanyHistory] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newCompany, setNewCompany] = useState("");

  const { data: userData } = useQuery<{ companyHistory: string[]; specialties: string[] }>({
    queryKey: [`/api/users/${userId}`],
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
      setCompanyHistory(userData.companyHistory || []);
      setSpecialties(userData.specialties || []);
    }
  }, [userData, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          companyHistory,
          specialties,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated!",
        description: "Your professional background has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleClose = () => {
    if (updateMutation.isPending) return;
    onClose();
  };

  const addCompany = () => {
    if (newCompany.trim() && !companyHistory.includes(newCompany.trim())) {
      setCompanyHistory([...companyHistory, newCompany.trim()]);
      setNewCompany("");
    }
  };

  const removeCompany = (company: string) => {
    setCompanyHistory(companyHistory.filter(c => c !== company));
  };

  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty));
    } else {
      setSpecialties([...specialties, specialty]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-primary" />
            <DialogTitle>Edit Professional Background</DialogTitle>
          </div>
          <DialogDescription>
            Share your career journey and areas of expertise
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="companyHistory">Company History</Label>
            <p className="text-sm text-muted-foreground">
              Add companies you've worked at to showcase your experience
            </p>
            <div className="flex gap-2">
              <Input
                id="companyHistory"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="e.g., Google, Amazon, Microsoft"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCompany();
                  }
                }}
              />
              <Button type="button" onClick={addCompany} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {companyHistory.map((company) => (
                <Badge
                  key={company}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 flex items-center gap-1"
                >
                  {company}
                  <button
                    type="button"
                    onClick={() => removeCompany(company)}
                    className="ml-1 rounded-full hover:bg-background/50 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Areas of Expertise</Label>
            <p className="text-sm text-muted-foreground">
              Select your specialties to help others find your expertise
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
              {specialtyOptions.map((specialty) => (
                <div
                  key={specialty}
                  onClick={() => toggleSpecialty(specialty)}
                  className={`p-2 rounded border cursor-pointer transition-colors ${
                    specialties.includes(specialty)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <span className="text-sm">{specialty}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {specialties.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  {specialties.map((specialty) => (
                    <Badge key={specialty} variant="default">
                      {specialty}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </div>

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
