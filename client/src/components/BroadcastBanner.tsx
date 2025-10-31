import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Radio } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export function BroadcastBanner() {
  const { idToken } = useAuth();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);

  const { data: broadcast } = useQuery({
    queryKey: ['/api/broadcasts/latest'],
    queryFn: async () => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch('/api/broadcasts/latest', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch broadcast');
      return res.json();
    },
    enabled: !!idToken,
    refetchInterval: 60000,
  });

  const viewMutation = useMutation({
    mutationFn: async (broadcastId: string) => {
      if (!idToken) throw new Error('Not authenticated');
      await fetch(`/api/broadcasts/${broadcastId}/view`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (broadcastId: string) => {
      if (!idToken) throw new Error('Not authenticated');
      await fetch(`/api/broadcasts/${broadcastId}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
    },
    onSuccess: () => {
      setDismissed(true);
      queryClient.invalidateQueries({ queryKey: ['/api/broadcasts/latest'] });
    },
  });

  useEffect(() => {
    if (broadcast?.broadcast && !broadcast.hasViewed) {
      viewMutation.mutate(broadcast.broadcast.id);
    }
  }, [broadcast?.broadcast?.id]);

  useEffect(() => {
    if (broadcast?.hasDismissed) {
      setDismissed(true);
    } else {
      setDismissed(false);
    }
  }, [broadcast?.hasDismissed]);

  if (!broadcast?.broadcast || dismissed || broadcast.hasDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Radio className="h-5 w-5 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{broadcast.broadcast.title}</h3>
              <p className="text-sm opacity-90">{broadcast.broadcast.message}</p>
            </div>
          </div>
          <button
            onClick={() => dismissMutation.mutate(broadcast.broadcast.id)}
            className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
