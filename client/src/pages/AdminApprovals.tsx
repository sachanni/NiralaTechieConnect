import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Check, X, User, Calendar, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminApprovals() {
  const { idToken } = useAuth();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<{ [key: string]: boolean }>({});

  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/pending-ideas'],
    queryFn: async () => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/pending-ideas', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch pending ideas');
      return res.json();
    },
    enabled: !!idToken,
  });

  const approveMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch(`/api/admin/ideas/${ideaId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error('Failed to approve idea');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ ideaId, reason }: { ideaId: string; reason: string }) => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch(`/api/admin/ideas/${ideaId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error('Failed to reject idea');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
      setShowRejectForm({ ...showRejectForm, [variables.ideaId]: false });
      setRejectReason({ ...rejectReason, [variables.ideaId]: '' });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Idea Approvals</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve or reject pending ideas from community members.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.ideas?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No pending ideas to review at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data?.ideas?.map((idea: any) => (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-4">
                    <span className="flex-1">{idea.title}</span>
                    <span className="text-xs font-normal px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                      Pending
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {idea.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Founder:</span>
                      <span className="font-medium">{idea.poster.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UsersIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Roles:</span>
                      <span className="font-medium">{idea.rolesNeeded.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Posted:</span>
                      <span className="font-medium">{format(new Date(idea.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pay Structure:</p>
                    <p className="font-medium">{idea.payStructure}</p>
                  </div>

                  {!showRejectForm[idea.id] ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => approveMutation.mutate(idea.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectForm({ ...showRejectForm, [idea.id]: true })}
                        className="flex-1 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                      <Textarea
                        placeholder="Provide a reason for rejection..."
                        value={rejectReason[idea.id] || ''}
                        onChange={(e) => setRejectReason({ ...rejectReason, [idea.id]: e.target.value })}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => rejectMutation.mutate({ ideaId: idea.id, reason: rejectReason[idea.id] || 'No reason provided' })}
                          disabled={rejectMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowRejectForm({ ...showRejectForm, [idea.id]: false })}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
