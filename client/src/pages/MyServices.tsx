import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { SERVICE_CATEGORIES } from "../../../shared/serviceCategories";
import { Settings, ArrowLeft, Check, X, Loader2, Sparkles, Search, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface MyServicesProps {
  userId: string;
  idToken: string;
}

interface UserService {
  id: string;
  userId: string;
  serviceId: string;
  categoryId: string;
  roleType: string;
  createdAt: Date;
}

interface ServiceSelection {
  serviceId: string;
  categoryId: string;
  isProvider: boolean;
  isSeeker: boolean;
}

export default function MyServices({ userId, idToken }: MyServicesProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selections, setSelections] = useState<Map<string, ServiceSelection>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const lastSavedSelectionsRef = useRef<string>("");

  // Fetch user's current services
  const { data: servicesData, isLoading } = useQuery<{ services: UserService[] }>({
    queryKey: ['user-services', userId],
    queryFn: async () => {
      const response = await fetch('/api/users/services', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
    enabled: !!idToken,
  });

  // Initialize selections from fetched data
  useEffect(() => {
    if (servicesData?.services) {
      const newSelections = new Map<string, ServiceSelection>();
      
      servicesData.services.forEach(service => {
        const key = service.serviceId;
        const existing = newSelections.get(key);
        
        if (existing) {
          if (service.roleType === 'provider') {
            existing.isProvider = true;
          } else if (service.roleType === 'seeker') {
            existing.isSeeker = true;
          }
        } else {
          newSelections.set(key, {
            serviceId: service.serviceId,
            categoryId: service.categoryId,
            isProvider: service.roleType === 'provider',
            isSeeker: service.roleType === 'seeker',
          });
        }
      });
      
      setSelections(newSelections);
      // Store the serialized state as the last saved state (sorted for stable comparison)
      const sortedEntries = Array.from(newSelections.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      lastSavedSelectionsRef.current = JSON.stringify(sortedEntries);
      isInitialLoad.current = false;
    }
  }, [servicesData]);

  // Auto-save effect with debouncing
  useEffect(() => {
    // Skip auto-save on initial load
    if (isInitialLoad.current) {
      return;
    }

    // Compare current selections with last saved state (sorted for stable comparison)
    const sortedEntries = Array.from(selections.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const currentState = JSON.stringify(sortedEntries);
    if (currentState === lastSavedSelectionsRef.current) {
      // No changes detected, skip auto-save
      setHasUnsavedChanges(false);
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);

    // Set new timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [selections]);

  const handleAutoSave = () => {
    const servicesToSave: Array<{serviceId: string; categoryId: string; roleType: string}> = [];
    
    selections.forEach(selection => {
      if (selection.isProvider) {
        servicesToSave.push({
          serviceId: selection.serviceId,
          categoryId: selection.categoryId,
          roleType: 'provider',
        });
      }
      if (selection.isSeeker) {
        servicesToSave.push({
          serviceId: selection.serviceId,
          categoryId: selection.categoryId,
          roleType: 'seeker',
        });
      }
    });
    
    setIsSaving(true);
    // Don't use the global mutation to avoid query invalidation loop
    fetch('/api/users/services', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ services: servicesToSave }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save services');
        }
        return response.json();
      })
      .then(() => {
        // Update last saved state to prevent re-triggering (sorted for stable comparison)
        const sortedEntries = Array.from(selections.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        lastSavedSelectionsRef.current = JSON.stringify(sortedEntries);
        // Invalidate cache to update Profile and Dashboard counts
        queryClient.invalidateQueries({ queryKey: ['user-services', userId] });
        setIsSaving(false);
        setHasUnsavedChanges(false);
      })
      .catch((error: any) => {
        setIsSaving(false);
        setHasUnsavedChanges(false);
        toast({
          title: "Failed to save",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      });
  };

  // Save services mutation
  const saveServicesMutation = useMutation({
    mutationFn: async (services: Array<{serviceId: string; categoryId: string; roleType: string}>) => {
      const response = await fetch('/api/users/services', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ services }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save services');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-services', userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleServiceRole = (serviceId: string, categoryId: string, role: 'provider' | 'seeker') => {
    const newSelections = new Map(selections);
    const existing = newSelections.get(serviceId);
    
    if (existing) {
      // If clicking the same role that's already selected, deselect it
      if (role === 'provider' && existing.isProvider) {
        newSelections.delete(serviceId);
      } else if (role === 'seeker' && existing.isSeeker) {
        newSelections.delete(serviceId);
      } else {
        // Switch to the new role (mutually exclusive)
        existing.isProvider = role === 'provider';
        existing.isSeeker = role === 'seeker';
      }
    } else {
      // New selection
      newSelections.set(serviceId, {
        serviceId,
        categoryId,
        isProvider: role === 'provider',
        isSeeker: role === 'seeker',
      });
    }
    
    setSelections(newSelections);
  };

  const handleSave = () => {
    const servicesToSave: Array<{serviceId: string; categoryId: string; roleType: string}> = [];
    
    selections.forEach(selection => {
      if (selection.isProvider) {
        servicesToSave.push({
          serviceId: selection.serviceId,
          categoryId: selection.categoryId,
          roleType: 'provider',
        });
      }
      if (selection.isSeeker) {
        servicesToSave.push({
          serviceId: selection.serviceId,
          categoryId: selection.categoryId,
          roleType: 'seeker',
        });
      }
    });
    
    saveServicesMutation.mutate(servicesToSave);
  };

  const getSelectedCount = () => {
    return selections.size;
  };

  const getCategorySelectedCount = (categoryId: string) => {
    let count = 0;
    selections.forEach(selection => {
      if (selection.categoryId === categoryId) {
        count++;
      }
    });
    return count;
  };

  // Filter categories and services based on search query
  const filteredCategories = SERVICE_CATEGORIES.map(category => {
    const filteredServices = category.services.filter(service => {
      const query = searchQuery.toLowerCase();
      return (
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query)
      );
    });
    
    return {
      ...category,
      services: filteredServices,
    };
  }).filter(category => category.services.length > 0);

  const hasSearchResults = filteredCategories.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold">My Services</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation('/profile')} className="hidden md:flex">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Select the services you offer or need. Choose one role per service - you can either offer or seek a service, not both.
          </p>
          <div className="mt-3 md:mt-4 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs md:text-sm">
              {getSelectedCount()} service{getSelectedCount() !== 1 ? 's' : ''} selected
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search services by name, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              {hasSearchResults 
                ? `Found ${filteredCategories.reduce((acc, cat) => acc + cat.services.length, 0)} service${filteredCategories.reduce((acc, cat) => acc + cat.services.length, 0) !== 1 ? 's' : ''} in ${filteredCategories.length} categor${filteredCategories.length !== 1 ? 'ies' : 'y'}`
                : 'No services match your search'
              }
            </p>
          )}
        </div>

        {getSelectedCount() === 0 && !searchQuery && (
          <Card className="mb-6 border-dashed border-2 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Get Started with My Services</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't selected any services yet. Choose the services you offer or need to connect with community members.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-background rounded-lg p-4 border">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Browse Categories</h4>
                  <p className="text-xs text-muted-foreground">Explore different service categories below</p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Offer Your Skills</h4>
                  <p className="text-xs text-muted-foreground">Toggle "I offer this" to share your expertise</p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Find Help</h4>
                  <p className="text-xs text-muted-foreground">Toggle "I need this" to get assistance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {searchQuery && !hasSearchResults && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No services found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or browse all categories below
              </p>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        <Accordion 
          type="multiple" 
          className="space-y-3 md:space-y-4"
          value={searchQuery ? filteredCategories.map(c => c.id) : undefined}
        >
          {(searchQuery ? filteredCategories : SERVICE_CATEGORIES).map((category) => {
            const categoryCount = getCategorySelectedCount(category.id);
            
            return (
              <AccordionItem key={category.id} value={category.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-2 md:gap-3 flex-1">
                    <span className="text-2xl md:text-3xl">{category.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm md:text-base font-semibold">{category.name}</h3>
                        {categoryCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {categoryCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{category.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
                    {category.services.map((service) => {
                      const selection = selections.get(service.id);
                      const isProvider = selection?.isProvider || false;
                      const isSeeker = selection?.isSeeker || false;
                      
                      return (
                        <Card key={service.id} className={`${(isProvider || isSeeker) ? 'border-primary bg-primary/5' : ''}`}>
                          <CardContent className="p-3 md:p-4">
                            <div className="flex items-start justify-between gap-3 md:gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm md:text-base font-medium">{service.name}</h4>
                                  {(isProvider || isSeeker) && (
                                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs md:text-sm text-muted-foreground mb-3">{service.description}</p>
                                
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                  <div className="flex items-center gap-2.5 min-h-[44px] sm:min-h-0">
                                    <Switch
                                      id={`${service.id}-provider`}
                                      checked={isProvider}
                                      onCheckedChange={() => toggleServiceRole(service.id, category.id, 'provider')}
                                      className="scale-110 sm:scale-100"
                                    />
                                    <Label htmlFor={`${service.id}-provider`} className="cursor-pointer">
                                      <Badge variant={isProvider ? "default" : "outline"} className="text-xs py-1.5 px-2.5">
                                        ✨ I offer this
                                      </Badge>
                                    </Label>
                                  </div>
                                  
                                  <div className="flex items-center gap-2.5 min-h-[44px] sm:min-h-0">
                                    <Switch
                                      id={`${service.id}-seeker`}
                                      checked={isSeeker}
                                      onCheckedChange={() => toggleServiceRole(service.id, category.id, 'seeker')}
                                      className="scale-110 sm:scale-100"
                                    />
                                    <Label htmlFor={`${service.id}-seeker`} className="cursor-pointer">
                                      <Badge variant={isSeeker ? "default" : "outline"} className="text-xs py-1.5 px-2.5">
                                        🔍 I need this
                                      </Badge>
                                    </Label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-6 md:mt-8 sticky bottom-0 md:bottom-4 left-0 right-0 md:left-auto md:right-auto bg-background/95 backdrop-blur p-3 md:p-4 rounded-none md:rounded-lg border-t md:border shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs md:text-sm text-muted-foreground font-medium">
              {getSelectedCount()} service{getSelectedCount() !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {isSaving ? (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : hasUnsavedChanges ? (
                <div className="flex items-center gap-2 text-xs md:text-sm text-amber-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span>Saving shortly...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs md:text-sm text-green-600">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>All changes saved</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/profile')}
                disabled={isSaving}
                className="md:hidden"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Done
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/profile')}
                disabled={isSaving}
                className="hidden md:flex"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
