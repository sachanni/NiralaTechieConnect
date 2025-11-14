import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail, 
  ShoppingBag, 
  Briefcase, 
  Users, 
  Home as HomeIcon, 
  Calendar,
  ArrowLeft,
  Save,
  Check
} from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface NotificationPreference {
  id: string;
  userId: string;
  category: string;
  subcategory: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  emailFrequency: string;
}

interface NotificationSettingsProps {
  idToken: string;
  userId: string;
}

const CATEGORY_CONFIG = {
  communications: {
    icon: Bell,
    label: "Communications",
    description: "Messages, mentions, and direct interactions",
    subcategories: [
      { value: "all", label: "All Communications" },
      { value: "messages", label: "Direct Messages" },
      { value: "mentions", label: "Mentions & Tags" },
    ],
  },
  marketplace: {
    icon: ShoppingBag,
    label: "Marketplace",
    description: "Items, offers, and transactions",
    subcategories: [
      { value: "all", label: "All Marketplace Activity" },
      { value: "new_items", label: "New Items in Interested Categories" },
      { value: "offers", label: "Offers on My Items" },
      { value: "transactions", label: "Transaction Updates" },
    ],
  },
  jobs: {
    icon: Briefcase,
    label: "Jobs",
    description: "Job postings and application updates",
    subcategories: [
      { value: "all", label: "All Job Activity" },
      { value: "new_jobs", label: "New Job Postings" },
      { value: "applications", label: "Application Status Updates" },
    ],
  },
  community: {
    icon: Users,
    label: "Community",
    description: "Forum posts, comments, and interactions",
    subcategories: [
      { value: "all", label: "All Community Activity" },
      { value: "replies", label: "Replies to My Posts" },
      { value: "mentions", label: "Mentions in Posts" },
    ],
  },
  rentals: {
    icon: HomeIcon,
    label: "Rentals",
    description: "Rental bookings and requests",
    subcategories: [
      { value: "all", label: "All Rental Activity" },
      { value: "bookings", label: "Booking Requests" },
      { value: "updates", label: "Booking Updates" },
    ],
  },
  events: {
    icon: Calendar,
    label: "Events",
    description: "Event updates and reminders",
    subcategories: [
      { value: "all", label: "All Event Activity" },
      { value: "new_events", label: "New Events" },
      { value: "reminders", label: "Event Reminders" },
      { value: "rsvp", label: "RSVP Updates" },
    ],
  },
};

export default function NotificationSettings({ idToken, userId }: NotificationSettingsProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const queryClient = useQueryClient();

  const { data: preferencesData, isLoading } = useQuery<{ preferences: NotificationPreference[] }>({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
    enabled: !!idToken,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<NotificationPreference>[]) => {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onMutate: async (preferences) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notification-preferences', userId] });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData(['notification-preferences', userId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['notification-preferences', userId], (old: any) => {
        if (!old?.preferences) return old;
        
        const updated = [...old.preferences];
        preferences.forEach(pref => {
          const index = updated.findIndex(p => p.id === pref.id);
          if (index !== -1) {
            updated[index] = { ...updated[index], ...pref };
          }
        });
        
        return { preferences: updated };
      });

      return { previousPreferences };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', userId] });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: (err, preferences, context) => {
      // Rollback to previous value on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(['notification-preferences', userId], context.previousPreferences);
      }
      setSaveStatus("idle");
      alert('Failed to save preferences. Please try again.');
    },
  });

  const preferences = preferencesData?.preferences || [];

  const getPreference = (category: string, subcategory: string = "all") => {
    return preferences.find(p => p.category === category && p.subcategory === subcategory);
  };

  const updatePreference = (
    category: string, 
    subcategory: string, 
    field: 'inAppEnabled' | 'emailEnabled' | 'emailFrequency', 
    value: boolean | string
  ) => {
    const pref = getPreference(category, subcategory);
    if (!pref) return;

    const updated = { ...pref, [field]: value };
    setSaveStatus("saving");
    updatePreferencesMutation.mutate([{
      id: pref.id,
      [field]: value,
    }]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Loading preferences...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notifications
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Control how and when you receive notifications
          </p>
        </div>

        {/* Save Status */}
        {saveStatus !== "idle" && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-800">
            {saveStatus === "saving" ? (
              <>
                <Save className="h-4 w-4 animate-spin" />
                Saving preferences...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Preferences saved successfully!
              </>
            )}
          </div>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
              const Icon = config.icon;
              const mainPref = getPreference(category, "all");

              return (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{config.label}</CardTitle>
                          <CardDescription>{config.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${category}-in-app`} className="text-sm text-muted-foreground">
                          In-App
                        </Label>
                        <Switch
                          id={`${category}-in-app`}
                          checked={mainPref?.inAppEnabled || false}
                          onCheckedChange={(checked) => 
                            updatePreference(category, "all", "inAppEnabled", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {config.subcategories.slice(1).map((sub) => {
                        const subPref = getPreference(category, sub.value);
                        return (
                          <div key={sub.value} className="flex items-center justify-between py-2">
                            <Label htmlFor={`${category}-${sub.value}`} className="text-sm font-normal">
                              {sub.label}
                            </Label>
                            <Switch
                              id={`${category}-${sub.value}`}
                              checked={subPref?.inAppEnabled || false}
                              onCheckedChange={(checked) => 
                                updatePreference(category, sub.value, "inAppEnabled", checked)
                              }
                              disabled={!mainPref?.inAppEnabled}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notification Settings
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
                  const Icon = config.icon;
                  const mainPref = getPreference(category, "all");

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Label className="font-medium">{config.label}</Label>
                        </div>
                        <Switch
                          checked={mainPref?.emailEnabled || false}
                          onCheckedChange={(checked) => 
                            updatePreference(category, "all", "emailEnabled", checked)
                          }
                        />
                      </div>
                      {mainPref?.emailEnabled && (
                        <div className="ml-7 pl-4 border-l-2 border-gray-200">
                          <Label className="text-sm text-muted-foreground mb-2 block">
                            Email Frequency
                          </Label>
                          <RadioGroup
                            value={mainPref.emailFrequency}
                            onValueChange={(value) => 
                              updatePreference(category, "all", "emailFrequency", value)
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="instant" id={`${category}-instant`} />
                              <Label htmlFor={`${category}-instant`} className="font-normal">
                                Instant (as they happen)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="daily" id={`${category}-daily`} />
                              <Label htmlFor={`${category}-daily`} className="font-normal">
                                Daily digest
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="weekly" id={`${category}-weekly`} />
                              <Label htmlFor={`${category}-weekly`} className="font-normal">
                                Weekly digest
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                      {category !== "events" && <Separator />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
