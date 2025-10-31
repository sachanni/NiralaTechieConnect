import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Lightbulb, Plus, Edit, Trash2, Users, Eye, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import PostIdeaModal from "@/components/PostIdeaModal";

interface User {
  id: string;
  fullName: string;
  email: string;
  company: string;
  profilePhotoUrl?: string | null;
  flatNumber: string;
  techStack: string[];
  yearsOfExperience: number;
}

interface Interest {
  id: string;
  ideaId: string;
  userId: string;
  message?: string | null;
  createdAt: string;
  user: User;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  rolesNeeded: string[];
  payStructure: string;
  status: string;
  interestCount: number;
  createdAt: string;
}

interface MyIdeasProps {
  userId?: string;
  idToken?: string;
}

function InterestsDialog({
  ideaId,
  ideaTitle,
  idToken,
  isOpen,
  onClose,
}: {
  ideaId: string;
  ideaTitle: string;
  idToken?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery<{ interests: Interest[] }>({
    queryKey: [`/api/ideas/${ideaId}/interests`],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/interests`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch interests');
      }
      return response.json();
    },
    enabled: isOpen && !!idToken,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interested Users</DialogTitle>
          <p className="text-sm text-muted-foreground">{ideaTitle}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading interests...</p>
            </div>
          ) : data?.interests && data.interests.length > 0 ? (
            data.interests.map((interest) => (
              <Card key={interest.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={interest.user.profilePhotoUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(interest.user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold">{interest.user.fullName}</h4>
                        <p className="text-sm text-muted-foreground">{interest.user.company}</p>
                        <p className="text-xs text-muted-foreground">
                          Flat {interest.user.flatNumber} • {interest.user.yearsOfExperience} years experience
                        </p>
                      </div>
                      {interest.user.techStack && interest.user.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {interest.user.techStack.slice(0, 5).map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {interest.user.techStack.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{interest.user.techStack.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                      {interest.message && (
                        <div className="bg-muted rounded-lg p-3 mt-2">
                          <p className="text-sm text-muted-foreground italic">"{interest.message}"</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Expressed interest {format(new Date(interest.createdAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No one has expressed interest yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MyIdeas({ userId, idToken }: MyIdeasProps = {}) {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInterestsDialogOpen, setIsInterestsDialogOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ ideas: Idea[] }>({
    queryKey: ['/api/ideas/my-ideas'],
    queryFn: async () => {
      const response = await fetch('/api/ideas/my-ideas', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },
    enabled: !!idToken,
  });

  const { data: interestsCountData } = useQuery<{ count: number }>({
    queryKey: ['/api/ideas/interests-count'],
    queryFn: async () => {
      const response = await fetch('/api/ideas/interests-count', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) return { count: 0 };
      return response.json();
    },
    enabled: !!idToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete idea');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Idea Deleted",
        description: "Your idea has been removed.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedIdea(null);
      queryClient.invalidateQueries({ queryKey: ['/api/ideas/my-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ideas/interests-count'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete idea",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsEditModalOpen(true);
  };

  const handleViewInterests = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsInterestsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; className: string } } = {
      'pending': { label: 'Pending Approval', className: 'bg-yellow-100 text-yellow-700' },
      'approved': { label: 'Approved', className: 'bg-green-100 text-green-700' },
      'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const canEditOrDelete = (status: string) => {
    return status === 'pending' || status === 'rejected';
  };

  const ideas = data?.ideas || [];
  const totalInterests = interestsCountData?.count || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">My Ideas</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsPostModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Post Idea
              </Button>
              <Link href="/ideas">
                <Button variant="outline">Back to Idea Wall</Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your posted ideas and track interest
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!isLoading && ideas.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interests Received</p>
                  <p className="text-3xl font-bold text-primary">{totalInterests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ideas Yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your startup idea with the community!
            </p>
            <Button onClick={() => setIsPostModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Idea
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => {
              const canModify = canEditOrDelete(idea.status);

              return (
                <Card key={idea.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <CardTitle className="text-xl flex-1">{idea.title}</CardTitle>
                          {getStatusBadge(idea.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {idea.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {idea.rolesNeeded.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{idea.interestCount} {idea.interestCount === 1 ? 'interest' : 'interests'}</span>
                        </div>
                        <span>•</span>
                        <span>Posted {format(new Date(idea.createdAt), 'PPP')}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInterests(idea)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Interests
                        </Button>
                        {canModify && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(idea)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(idea)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Idea</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete "{selectedIdea?.title}"? This action cannot be undone.
            </p>
          </div>
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
              onClick={() => selectedIdea && deleteMutation.mutate(selectedIdea.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedIdea && (
        <InterestsDialog
          ideaId={selectedIdea.id}
          ideaTitle={selectedIdea.title}
          idToken={idToken}
          isOpen={isInterestsDialogOpen}
          onClose={() => {
            setIsInterestsDialogOpen(false);
            setSelectedIdea(null);
          }}
        />
      )}

      <PostIdeaModal
        idToken={idToken}
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />

      {selectedIdea && (
        <PostIdeaModal
          idToken={idToken}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedIdea(null);
          }}
          editIdea={selectedIdea}
        />
      )}
    </div>
  );
}
