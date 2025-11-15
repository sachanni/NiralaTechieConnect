import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity as ActivityIcon, Heart, MessageSquare, Users, Briefcase, Lightbulb, Calendar, Search as SearchIcon, Megaphone, Loader2, Settings, UserPlus, UserMinus } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'interests'>('all');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch activity interests topics
  const { data: interestsData } = useQuery({
    queryKey: ['/api/activity-interests'],
    queryFn: async () => {
      const response = await fetch('/api/activity-interests', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch interests');
      return response.json();
    },
    enabled: !!idToken,
  });

  // Fetch user's selected interests
  const { data: userInterestsData, refetch: refetchUserInterests } = useQuery({
    queryKey: ['/api/me/activity-interests'],
    queryFn: async () => {
      const response = await fetch('/api/me/activity-interests', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user interests');
      return response.json();
    },
    enabled: !!idToken && activeTab === 'interests',
  });

  // Fetch following list
  const { data: followingData, refetch: refetchFollowing } = useQuery({
    queryKey: [`/api/users/${userId}/following`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/following`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch following');
      return response.json();
    },
    enabled: !!idToken && userId !== undefined,
  });

  // Infinite query for activity feed with filtering
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['/api/activity-feed', activeTab],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/activity-feed?filter=${activeTab}&limit=20&offset=${pageParam}`, {
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

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ targetUserId, targetUserName, isFollowing }: { targetUserId: string; targetUserName: string; isFollowing: boolean }) => {
      if (!idToken) {
        throw new Error('Authentication required');
      }
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update follow status');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === '/api/activity-feed'
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/following`] });
      toast({
        title: variables.isFollowing ? "Unfollowed" : "Following",
        description: variables.isFollowing 
          ? `You are no longer following ${variables.targetUserName}`
          : `You are now following ${variables.targetUserName}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to update follow status',
      });
    },
  });

  // Update interests mutation
  const updateInterestsMutation = useMutation({
    mutationFn: async (interestIds: string[]) => {
      if (!idToken) {
        throw new Error('Authentication required');
      }
      const response = await fetch('/api/me/activity-interests', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interestIds }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update interests');
      }
      return response.json();
    },
    onSuccess: (_, interestIds) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === '/api/activity-feed'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/me/activity-interests'] });
      toast({
        title: "Interests Updated",
        description: `${interestIds.length} ${interestIds.length === 1 ? 'topic' : 'topics'} selected. Your feed will reflect your preferences.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to update interests',
      });
    },
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ activityId, isLiked }: { activityId: string; isLiked: boolean }) => {
      if (!idToken) {
        throw new Error('Authentication required');
      }
      const url = `/api/activity-feed/${activityId}/like`;
      const response = await fetch(url, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update like');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === '/api/activity-feed'
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to update like',
      });
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
  const topics = interestsData?.topics || [];
  const userInterests = userInterestsData?.interests || [];
  const following = followingData?.following || [];
  const selectedInterestIds = userInterests.map((i: any) => i.interestId);

  const [manageInterestsOpen, setManageInterestsOpen] = useState(false);
  const [manageFollowingOpen, setManageFollowingOpen] = useState(false);
  const [pendingInterests, setPendingInterests] = useState<string[]>([]);

  useEffect(() => {
    setPendingInterests(selectedInterestIds);
  }, [userInterestsData]);

  const handleSaveInterests = async () => {
    await updateInterestsMutation.mutateAsync(pendingInterests);
    setManageInterestsOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between gap-4">
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
              data-testid="button-refresh-feed"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ActivityIcon className="w-4 h-4" />}
              <span className="hidden md:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabbed Feed */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'following' | 'interests')} className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all" data-testid="tab-all" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger value="following" data-testid="tab-following" className="gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Following</span>
                {following.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{following.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="interests" data-testid="tab-interests" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">My Interests</span>
                {userInterests.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{userInterests.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Manage buttons */}
            <div className="flex gap-2">
              {activeTab === 'following' && (
                <Dialog open={manageFollowingOpen} onOpenChange={setManageFollowingOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-manage-following">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Manage</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Manage Following</DialogTitle>
                      <DialogDescription>
                        People you follow. Their activity will appear in your Following feed.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {following.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                          You're not following anyone yet. Start following people to see their activity!
                        </p>
                      ) : (
                        following.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover-elevate">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                {user.profilePhotoUrl ? (
                                  <AvatarImage src={user.profilePhotoUrl} alt={user.fullName} />
                                ) : (
                                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.fullName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Following since {formatDistance(new Date(user.followedAt), new Date(), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => followMutation.mutate({ targetUserId: user.id, targetUserName: user.fullName, isFollowing: true })}
                              disabled={!idToken || followMutation.isPending}
                              data-testid={`button-unfollow-${user.id}`}
                            >
                              {followMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserMinus className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {activeTab === 'interests' && (
                <Dialog open={manageInterestsOpen} onOpenChange={setManageInterestsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-manage-interests">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Manage</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Manage My Interests</DialogTitle>
                      <DialogDescription>
                        Select topics you're interested in. Your feed will show relevant activity.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {topics.map((topic: any) => (
                        <div key={topic.id} className="flex items-start gap-3 p-3 rounded-lg border hover-elevate">
                          <Checkbox
                            id={topic.id}
                            checked={pendingInterests.includes(topic.id)}
                            onCheckedChange={(checked) => {
                              setPendingInterests(prev =>
                                checked
                                  ? [...prev, topic.id]
                                  : prev.filter(id => id !== topic.id)
                              );
                            }}
                            data-testid={`checkbox-interest-${topic.slug}`}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={topic.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {topic.label}
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setManageInterestsOpen(false)}
                        disabled={updateInterestsMutation.isPending}
                        data-testid="button-cancel-interests"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveInterests}
                        disabled={!idToken || updateInterestsMutation.isPending}
                        data-testid="button-save-interests"
                      >
                        {updateInterestsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : allActivities.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ActivityIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {activeTab === 'following' ? (
                    <div>
                      <p className="font-medium mb-2">No activity from people you follow</p>
                      <p className="text-sm text-muted-foreground">Start following people to see their updates here</p>
                    </div>
                  ) : activeTab === 'interests' ? (
                    <div>
                      <p className="font-medium mb-2">No activity matching your interests</p>
                      <p className="text-sm text-muted-foreground">
                        {userInterests.length === 0
                          ? "Select your interests to see relevant content"
                          : "No recent activity in your selected topics"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No activities yet. Start exploring the community!</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {allActivities.map((activity) => {
                  const isOwnActivity = activity.userId === userId;
                  const isFollowingUser = following.some((f: any) => f.id === activity.userId);

                  return (
                    <Card key={activity.id} className="hover-elevate transition-all" data-testid={`activity-card-${activity.id}`}>
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
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/profile/${activity.userId}`}>
                                  <p className="font-semibold text-sm md:text-base truncate hover:text-primary transition-colors cursor-pointer">
                                    {activity.user.fullName}
                                  </p>
                                </Link>
                                <span className={`${getActivityColor(activity.activityType)}`}>
                                  {getActivityIcon(activity.activityType)}
                                </span>
                              </div>
                              {!isOwnActivity && idToken && userId && (
                                <Button
                                  variant={isFollowingUser ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => followMutation.mutate({ 
                                    targetUserId: activity.userId, 
                                    targetUserName: activity.user.fullName,
                                    isFollowing: isFollowingUser 
                                  })}
                                  disabled={!idToken || followMutation.isPending}
                                  className="gap-2"
                                  data-testid={`button-follow-${activity.userId}`}
                                >
                                  {followMutation.isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : isFollowingUser ? (
                                    <>
                                      <UserMinus className="w-3 h-3" />
                                      <span className="hidden sm:inline">Unfollow</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus className="w-3 h-3" />
                                      <span className="hidden sm:inline">Follow</span>
                                    </>
                                  )}
                                </Button>
                              )}
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
                            disabled={!idToken || likeMutation.isPending}
                            data-testid={`button-like-${activity.id}`}
                          >
                            {likeMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Heart className="w-4 h-4" />
                            )}
                            <span className="text-xs md:text-sm">{activity.likeCount}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Load more trigger */}
                <div ref={loadMoreRef} className="py-4 text-center">
                  {isFetchingNextPage ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  ) : hasNextPage ? (
                    <p className="text-sm text-muted-foreground">Scroll for more</p>
                  ) : allActivities.length > 0 ? (
                    <p className="text-sm text-muted-foreground">You're all caught up! 🎉</p>
                  ) : null}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
