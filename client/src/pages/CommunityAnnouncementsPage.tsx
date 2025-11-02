import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Plus, Clock, Eye, AlertCircle } from 'lucide-react';
import type { CommunityAnnouncement, User } from '@db/schema';

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', variant: 'secondary' as const },
  { value: 'normal', label: 'Normal', variant: 'outline' as const },
  { value: 'high', label: 'High', variant: 'default' as const },
  { value: 'urgent', label: 'Urgent', variant: 'destructive' as const },
];

interface CommunityAnnouncementsPageProps {
  idToken: string;
}

export default function CommunityAnnouncementsPage({ idToken }: CommunityAnnouncementsPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expiryDays, setExpiryDays] = useState<string>('7');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userData } = useQuery<{ user: User }>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  const user = userData?.user;

  const { data: announcements = [] } = useQuery<CommunityAnnouncement[]>({
    queryKey: ['/api/announcements'],
    queryFn: async () => {
      const response = await fetch('/api/announcements', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
  });

  const { data: pendingAnnouncements = [] } = useQuery<CommunityAnnouncement[]>({
    queryKey: ['/api/announcements/pending'],
    enabled: user?.isAdmin === 1,
    queryFn: async () => {
      const response = await fetch('/api/announcements/pending', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending announcements');
      return response.json();
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: data,
      });
      if (!response.ok) throw new Error('Failed to create announcement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      setIsDialogOpen(false);
      toast({
        title: 'Submitted for approval',
        description: 'Your announcement will be reviewed by admin before publishing.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create announcement. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const approveAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await fetch(`/api/announcements/${announcementId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to approve');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/pending'] });
      toast({
        title: 'Announcement approved',
        description: 'The announcement is now visible to all residents.',
      });
    },
  });

  const rejectAnnouncementMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/announcements/${id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to reject');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/pending'] });
      toast({
        title: 'Announcement rejected',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (expiryDays && parseInt(expiryDays) > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
      formData.append('expiresAt', expiryDate.toISOString());
    }
    
    createAnnouncementMutation.mutate(formData);
  };

  const activeAnnouncements = announcements.filter(
    (a) => a.status === 'approved' && (!a.expiresAt || new Date(a.expiresAt) > new Date())
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Megaphone className="h-8 w-8" />
              Community Announcements
            </h1>
            <p className="text-muted-foreground mt-1">
              Society-wide notices and important updates
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Your announcement will be reviewed by admin before publishing
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Water supply maintenance on Sunday"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Provide detailed information about the announcement..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="normal" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDays">Expiry (days from now)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    min="1"
                    max="90"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    placeholder="7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Announcement will auto-hide after this period
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Images (optional)</Label>
                  <Input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createAnnouncementMutation.isPending}
                >
                  {createAnnouncementMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {user?.isAdmin === 1 && pendingAnnouncements.length > 0 && (
          <Card className="p-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Pending Approvals ({pendingAnnouncements.length})
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Review and approve announcements below
                  </p>
                </div>
                <div className="space-y-3">
                  {pendingAnnouncements.map((announcement) => (
                    <Card key={announcement.id} className="p-4 bg-background">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold">{announcement.title}</h4>
                              <Badge className="mt-2" variant={PRIORITY_LEVELS.find(p => p.value === announcement.priority)?.variant}>
                                {announcement.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm mt-2">{announcement.content}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveAnnouncementMutation.mutate(announcement.id)}
                            disabled={approveAnnouncementMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = prompt('Rejection reason (optional):');
                              if (reason !== null) {
                                rejectAnnouncementMutation.mutate({
                                  id: announcement.id,
                                  reason: reason || 'Not specified',
                                });
                              }
                            }}
                            disabled={rejectAnnouncementMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {activeAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                No active announcements at the moment
              </p>
            </div>
          ) : (
            activeAnnouncements.map((announcement) => {
              const priorityConfig = PRIORITY_LEVELS.find(p => p.value === announcement.priority);
              return (
                <Card
                  key={announcement.id}
                  className={`p-6 ${announcement.priority === 'urgent' ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''}`}
                >
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-semibold">{announcement.title}</h3>
                        <Badge variant={priorityConfig?.variant}>
                          {priorityConfig?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(announcement.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{announcement.viewCount} views</span>
                        </div>
                        {announcement.expiresAt && (
                          <span>
                            Expires on {new Date(announcement.expiresAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {announcement.content}
                    </p>

                    {announcement.images && announcement.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {announcement.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Announcement image ${idx + 1}`}
                            className="h-48 w-auto object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
