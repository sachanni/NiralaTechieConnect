import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings2, Shield, Bell, Power, ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface SettingsProps {
  idToken?: string;
}

interface UserSettings {
  isActive: number;
  profileVisibility: string;
  allowMessages: string;
  showEmail: number;
  showPhone: number;
  notificationPreferences: string;
}

interface NotificationPrefs {
  jobs: boolean;
  messages: boolean;
  skillSwap: boolean;
  ideas: boolean;
  events: boolean;
  forum: boolean;
}

export default function Settings({ idToken }: SettingsProps = {}) {
  const { toast } = useToast();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [isAccountActive, setIsAccountActive] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    jobs: true,
    messages: true,
    skillSwap: true,
    ideas: true,
    events: true,
    forum: true,
  });
  const [confirmedNotificationPrefs, setConfirmedNotificationPrefs] = useState<NotificationPrefs>({
    jobs: true,
    messages: true,
    skillSwap: true,
    ideas: true,
    events: true,
    forum: true,
  });

  const { data: settingsData, isLoading } = useQuery<{ settings: UserSettings }>({
    queryKey: ['/api/users/settings'],
    queryFn: async () => {
      const response = await fetch('/api/users/settings', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
    enabled: !!idToken,
  });

  const settings = settingsData?.settings;

  useEffect(() => {
    if (settings) {
      setIsAccountActive(settings.isActive === 1);
      try {
        const prefs: NotificationPrefs = JSON.parse(settings.notificationPreferences);
        setNotificationPrefs(prefs);
        setConfirmedNotificationPrefs(prefs);
      } catch {
        const defaultPrefs = {
          jobs: true,
          messages: true,
          skillSwap: true,
          ideas: true,
          events: true,
          forum: true,
        };
        setNotificationPrefs(defaultPrefs);
        setConfirmedNotificationPrefs(defaultPrefs);
      }
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update settings');
      }
      return response.json();
    },
    onMutate: async (variables) => {
      if (variables.notificationPreferences) {
        return { previousPrefs: confirmedNotificationPrefs };
      }
      return {};
    },
    onSuccess: (data, variables) => {
      if (variables.notificationPreferences) {
        try {
          const updatedPrefs: NotificationPrefs = JSON.parse(variables.notificationPreferences);
          setConfirmedNotificationPrefs(updatedPrefs);
        } catch {}
      }
      queryClient.invalidateQueries({ queryKey: ['/api/users/settings'] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: (error: any, variables, context: any) => {
      if (context?.previousPrefs) {
        setNotificationPrefs(context.previousPrefs);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/users/settings'] });
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleToggleAccountStatus = () => {
    if (isAccountActive) {
      setDeactivateDialogOpen(true);
    } else {
      updateSettingsMutation.mutate({ isActive: 1 });
      setIsAccountActive(true);
    }
  };

  const confirmDeactivate = () => {
    updateSettingsMutation.mutate({ isActive: 0 });
    setIsAccountActive(false);
    setDeactivateDialogOpen(false);
  };

  const handlePrivacyChange = (field: keyof UserSettings, value: any) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleNotificationToggle = (category: keyof NotificationPrefs) => {
    setNotificationPrefs(prev => {
      const newPrefs = {
        ...prev,
        [category]: !prev[category],
      };
      
      updateSettingsMutation.mutate({ 
        notificationPreferences: JSON.stringify(newPrefs) 
      });
      
      return newPrefs;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pb-0">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Account Status Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Power className="w-5 h-5 text-primary" />
              <CardTitle>Account Status</CardTitle>
            </div>
            <CardDescription>
              Temporarily deactivate your account to hide your profile from searches and disable notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="account-status" className="text-base font-medium">
                  Account Active
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isAccountActive 
                    ? "Your profile is visible and searchable" 
                    : "Your profile is hidden from searches"}
                </p>
              </div>
              <Switch
                id="account-status"
                checked={isAccountActive}
                onCheckedChange={handleToggleAccountStatus}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Controls Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Privacy Controls</CardTitle>
            </div>
            <CardDescription>
              Control who can see your information and contact you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility" className="text-base font-medium">
                Profile Visibility
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Who can view your profile
              </p>
              <Select
                value={settings?.profileVisibility || 'everyone'}
                onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                disabled={updateSettingsMutation.isPending}
              >
                <SelectTrigger id="profile-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="members">Community Members Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="allow-messages" className="text-base font-medium">
                Who Can Message You
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Control who can send you direct messages
              </p>
              <Select
                value={settings?.allowMessages || 'everyone'}
                onValueChange={(value) => handlePrivacyChange('allowMessages', value)}
                disabled={updateSettingsMutation.isPending}
              >
                <SelectTrigger id="allow-messages">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="connections">My Connections Only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base font-medium">Contact Information</Label>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="show-email" className="text-sm font-medium">
                    Show Email on Profile
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display your email address publicly
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings?.showEmail === 1}
                  onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked ? 1 : 0)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="show-phone" className="text-sm font-medium">
                    Show Phone on Profile
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display your phone number publicly
                  </p>
                </div>
                <Switch
                  id="show-phone"
                  checked={settings?.showPhone === 1}
                  onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked ? 1 : 0)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Choose which in-app notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="notif-jobs" className="text-sm font-medium">
                  💼 Job Board
                </Label>
                <p className="text-xs text-muted-foreground">
                  New jobs, application updates, new applicants
                </p>
              </div>
              <Switch
                id="notif-jobs"
                checked={notificationPrefs.jobs}
                onCheckedChange={() => handleNotificationToggle('jobs')}
                disabled={updateSettingsMutation.isPending || isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="notif-messages" className="text-sm font-medium">
                  💬 Messages
                </Label>
                <p className="text-xs text-muted-foreground">
                  New messages and message requests
                </p>
              </div>
              <Switch
                id="notif-messages"
                checked={notificationPrefs.messages}
                onCheckedChange={() => handleNotificationToggle('messages')}
                disabled={updateSettingsMutation.isPending || isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="notif-skillswap" className="text-sm font-medium">
                  🎓 Skill Swap
                </Label>
                <p className="text-xs text-muted-foreground">
                  Session requests, bookings, and reminders
                </p>
              </div>
              <Switch
                id="notif-skillswap"
                checked={notificationPrefs.skillSwap}
                onCheckedChange={() => handleNotificationToggle('skillSwap')}
                disabled={updateSettingsMutation.isPending || isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="notif-ideas" className="text-sm font-medium">
                  💡 Ideas
                </Label>
                <p className="text-xs text-muted-foreground">
                  Upvotes, comments, and team applications
                </p>
              </div>
              <Switch
                id="notif-ideas"
                checked={notificationPrefs.ideas}
                onCheckedChange={() => handleNotificationToggle('ideas')}
                disabled={updateSettingsMutation.isPending || isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="notif-events" className="text-sm font-medium">
                  🎟️ Events
                </Label>
                <p className="text-xs text-muted-foreground">
                  New events, RSVPs, and check-in reminders
                </p>
              </div>
              <Switch
                id="notif-events"
                checked={notificationPrefs.events}
                onCheckedChange={() => handleNotificationToggle('events')}
                disabled={updateSettingsMutation.isPending || isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="notif-forum" className="text-sm font-medium">
                  💭 Forum
                </Label>
                <p className="text-xs text-muted-foreground">
                  Replies, mentions, and best answers
                </p>
              </div>
              <Switch
                id="notif-forum"
                checked={notificationPrefs.forum}
                onCheckedChange={() => handleNotificationToggle('forum')}
                disabled={updateSettingsMutation.isPending || isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deactivate Account Confirmation Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile will be hidden from searches and you won't receive any notifications. 
              You can reactivate your account anytime by logging back in and turning it back on.
              <br /><br />
              <strong>Note:</strong> All your data will be safely stored and nothing will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeactivate}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deactivate Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
