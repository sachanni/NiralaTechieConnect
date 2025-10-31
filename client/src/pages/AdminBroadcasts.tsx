import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Radio, Users, Calendar, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminBroadcasts() {
  const { idToken } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/broadcasts'],
    queryFn: async () => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/broadcasts', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch broadcasts');
      return res.json();
    },
    enabled: !!idToken,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, message })
      });
      if (!res.ok) throw new Error('Failed to create broadcast');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/broadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/broadcasts/latest'] });
      setTitle('');
      setMessage('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    createMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Broadcast Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send important announcements to all community members.
          </p>
        </div>

        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="text-purple-600" />
              Create New Broadcast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Broadcast Title
                </label>
                <Input
                  placeholder="e.g., Community Event Tomorrow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  placeholder="Enter your broadcast message here. All members will see this when they login."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending || !title.trim() || !message.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {createMutation.isPending ? 'Sending...' : 'Send Broadcast'}
              </Button>

              {createMutation.isSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
                  Broadcast sent successfully! All users will see it on their next login.
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">Broadcast History</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.broadcasts?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Radio className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No broadcasts sent yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data?.broadcasts?.map((broadcast: any) => (
                <Card key={broadcast.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{broadcast.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {broadcast.message}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>By {broadcast.admin.fullName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(broadcast.sentAt), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{broadcast.viewCount} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
