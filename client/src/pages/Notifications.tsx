import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, AlertCircle, Settings, ShoppingBag, Briefcase, Users, Home as HomeIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface Notification {
  id: string;
  type: string;
  category: string;
  payload: Record<string, any>;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsProps {
  idToken: string;
  userId: string;
}

const CATEGORY_CONFIG = {
  all: { label: "All", icon: Bell },
  communications: { label: "Communications", icon: Bell },
  marketplace: { label: "Marketplace", icon: ShoppingBag },
  jobs: { label: "Jobs", icon: Briefcase },
  community: { label: "Community", icon: Users },
  rentals: { label: "Rentals", icon: HomeIcon },
  events: { label: "Events", icon: Calendar },
};

export default function Notifications({ idToken, userId }: NotificationsProps) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data, isLoading, isError, error } = useQuery<{ notifications: Notification[] }>({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: !!idToken,
  });

  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const markAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications', userId] });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      alert('Failed to mark notification as read. Please try again.');
    } finally {
      setMarkingAsRead(null);
    }
  };

  const notifications = data?.notifications || [];
  const unreadNotifications = notifications.filter((n) => !n.readAt);
  
  // Filter notifications by category
  const filteredNotifications = selectedCategory === "all" 
    ? notifications 
    : notifications.filter(n => n.category === selectedCategory);
  
  // Count unread by category
  const getUnreadCount = (category: string) => {
    if (category === "all") {
      return unreadNotifications.length;
    }
    return notifications.filter(n => n.category === category && !n.readAt).length;
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications', userId] });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      alert('Failed to mark all as read. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadNotifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadNotifications.length} unread
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadNotifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={markAllAsRead}
                    data-testid="button-mark-all-read"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark all as read
                  </Button>
                )}
                <Link href="/notification-settings">
                  <Button variant="outline" size="sm" data-testid="button-notification-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-muted-foreground">Failed to load notifications</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : 'Please try again later'}
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll notify you when there's something new
                </p>
              </div>
            ) : (
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
                <TabsList className="w-full justify-start overflow-x-auto flex-wrap gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    const count = getUnreadCount(key);
                    return (
                      <TabsTrigger 
                        key={key} 
                        value={key}
                        className="flex items-center gap-2"
                        data-testid={`tab-${key}`}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                        {count > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                            {count}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                
                <TabsContent value={selectedCategory}>
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No {selectedCategory !== "all" ? CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG]?.label.toLowerCase() : ""} notifications
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We'll notify you when there's something new
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.readAt ? 'bg-white' : 'bg-blue-50 border-blue-200'
                          }`}
                          data-testid={`notification-${notification.id}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">
                                  {notification.payload?.title || notification.type}
                                </p>
                                {notification.category && notification.category !== "all" && (
                                  <Badge variant="outline" className="text-xs">
                                    {CATEGORY_CONFIG[notification.category as keyof typeof CATEGORY_CONFIG]?.label}
                                  </Badge>
                                )}
                              </div>
                              {notification.payload?.message && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.payload.message}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            {!notification.readAt && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                disabled={markingAsRead === notification.id}
                                data-testid={`button-mark-read-${notification.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
