import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useForumSubscriptions() {
  const { user, idToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: subscriptions = [] } = useQuery<string[]>({
    queryKey: ['forum', 'subscriptions'],
    queryFn: async () => {
      if (!user || !idToken) return [];
      const res = await fetch('/api/forum/subscriptions', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const data = await res.json();
      return data.categoryIds;
    },
    enabled: !!user && !!idToken,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch(`/api/forum/categories/${categoryId}/subscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to subscribe' }));
        throw new Error(error.error || 'Failed to subscribe');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'subscriptions'] });
      toast({
        title: "Subscribed",
        description: "You'll see updates from this category in your Discussions feed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!idToken) throw new Error('Not authenticated');
      const res = await fetch(`/api/forum/categories/${categoryId}/unsubscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to unsubscribe' }));
        throw new Error(error.error || 'Failed to unsubscribe');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'subscriptions'] });
      toast({
        title: "Unsubscribed",
        description: "You won't see updates from this category anymore.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unsubscribe failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isSubscribed = (categoryId: string) => subscriptions.includes(categoryId);

  const toggleSubscription = (categoryId: string) => {
    if (isSubscribed(categoryId)) {
      unsubscribeMutation.mutate(categoryId);
    } else {
      subscribeMutation.mutate(categoryId);
    }
  };

  return {
    subscriptions,
    isSubscribed,
    toggleSubscription,
    isLoading: subscribeMutation.isPending || unsubscribeMutation.isPending,
    error: subscribeMutation.error || unsubscribeMutation.error,
  };
}
