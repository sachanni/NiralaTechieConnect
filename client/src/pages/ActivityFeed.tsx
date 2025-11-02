import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity as ActivityIcon, Heart, MessageSquare, Users, Briefcase, Lightbulb, Calendar, Search as SearchIcon, Megaphone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

interface User {
  id: string;
  fullName: string;
  profilePhotoUrl?: string | null;
}

interface Activity {
  id: string;
  userId: string;
  activityType: string;
  targetType: string;
  targetId: string;
  content: string;
  metadata: string;
  likeCount: number;
  createdAt: string;
  user: User;
}

interface ActivityFeedProps {
  userId?: string;
  idToken?: string;
}

export default function ActivityFeed({ userId, idToken }: ActivityFeedProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite query for activity feed
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['/api/activity-feed'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/activity-feed?limit=20&offset=${pageParam}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch activity feed');
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      const totalLoaded = pages.reduce((acc, page) => acc + page.activities.length, 0);
      return lastPage.activities.length === 20 ? totalLoaded : undefined;
    },
    initialPageParam: 0,
    enabled: !!idToken,
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ activityId, isLiked }: { activityId: string; isLiked: boolean }) => {
      const url = `/api/activity-feed/${activityId}/like`;
      const response = await fetch(url, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to update like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity-feed'] });
    },
  });

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Activity feed updated",
    });
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'new_member': Users,
      'new_job': Briefcase,
      'new_idea': Lightbulb,
      'new_event': Calendar,
      'lost_found': SearchIcon,
      'announcement': Megaphone,
    };
    const Icon = icons[type] || ActivityIcon;
    return <Icon className="w-5 h-5" />;
  };

  const getActivityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'new_member': 'text-blue-500',
      'new_job': 'text-green-500',
      'new_idea': 'text-purple-500',
      'new_event': 'text-orange-500',
      'lost_found': 'text-yellow-500',
      'announcement': 'text-pink-500',
    };
    return colors[type] || 'text-gray-500';
  };

  const allActivities = data?.pages.flatMap(page => page.activities) || [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <ActivityIcon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Activity Feed</h1>
                <p className="text-xs md:text-sm text-muted-foreground">What's happening in Nirala Estate</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ActivityIcon className="w-4 h-4" />}
              <span className="hidden md:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : allActivities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ActivityIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No activities yet. Start exploring the community!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {allActivities.map((activity) => (
              <Card key={activity.id} className="hover-elevate transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      {activity.user.profilePhotoUrl ? (
                        <AvatarImage src={activity.user.profilePhotoUrl} alt={activity.user.fullName} />
                      ) : (
                        <AvatarFallback>{getInitials(activity.user.fullName)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm md:text-base truncate">{activity.user.fullName}</p>
                        <span className={`${getActivityColor(activity.activityType)}`}>
                          {getActivityIcon(activity.activityType)}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {formatDistance(new Date(activity.createdAt), new Date(), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm md:text-base mb-3">{activity.content}</p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => likeMutation.mutate({ activityId: activity.id, isLiked: false })}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-xs md:text-sm">{activity.likeCount}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="py-4 text-center">
              {isFetchingNextPage ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              ) : hasNextPage ? (
                <p className="text-sm text-muted-foreground">Scroll for more</p>
              ) : (
                <p className="text-sm text-muted-foreground">You're all caught up! 🎉</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
