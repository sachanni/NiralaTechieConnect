import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { Search, Plus, TrendingUp, Eye, MousePointer, Upload, X, Sparkles, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Advertisement {
  id: string;
  title: string;
  description: string;
  serviceCategory: string;
  imageUrl: string | null;
  servicePageContent: string;
  pricing: string;
  contactInfo: string;
  duration: number;
  status: string;
  advertiser: {
    id: string;
    name: string;
    location: string;
  };
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  viewsCount?: number;
  clicksCount?: number;
}

const SERVICE_CATEGORIES = [
  "Food Network",
  "Smart Mobility",
  "Group Buying & Gifts",
  "Kids & Parenting",
  "Learning & Classes",
  "Health & Wellness",
  "Professional Services",
  "Beauty & Personal Care",
  "Event Organizing"
];

const AD_DURATIONS = [
  { days: 7, label: "1 Week", price: 299 },
  { days: 30, label: "1 Month", price: 999 },
  { days: 90, label: "3 Months", price: 2499 },
  { days: 180, label: "6 Months", price: 4499 }
];

export default function AdvertiseServices() {
  const { user, idToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: ads = [], isLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("serviceCategory", selectedCategory);
      
      const response = await fetch(`/api/advertisements?${params}`, {
        headers: user ? {
          'Authorization': `Bearer ${idToken}`
        } : {}
      });
      if (!response.ok) throw new Error("Failed to fetch ads");
      return response.json();
    }
  });

  const { data: myAds = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements/my-ads", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/advertisements?advertiserId=${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch your ads");
      return response.json();
    },
    enabled: !!user
  });

  const trackViewMutation = useMutation({
    mutationFn: async (adId: string) => {
      await fetch(`/api/advertisements/${adId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: user?.uid || null })
      });
    }
  });

  const trackClickMutation = useMutation({
    mutationFn: async (adId: string) => {
      await fetch(`/api/advertisements/${adId}/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: user?.uid || null })
      });
    }
  });

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && ad.status === 'active';
  });

  const handleAdClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    trackViewMutation.mutate(ad.id);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Advertise Your Services</h1>
          <p className="text-muted-foreground">Promote your business to the entire community</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="browse">Browse Ads</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            {user && <TabsTrigger value="my-ads">My Ads</TabsTrigger>}
          </TabsList>

          {/* Browse Ads Tab */}
          <TabsContent value="browse" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {user && (
                <Button onClick={() => setShowCreateDialog(true)} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ad
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {SERVICE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="hidden md:block text-sm text-muted-foreground self-center col-span-2">
                {filteredAds.length} active {filteredAds.length === 1 ? 'ad' : 'ads'}
              </div>
            </div>

            {/* Ads Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg" />
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : filteredAds.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No ads found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                {user && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ad
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAds.map((ad) => (
                  <Card 
                    key={ad.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border-2 border-primary/20"
                    onClick={() => handleAdClick(ad)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                      {ad.imageUrl ? (
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="h-16 w-16 text-primary" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-primary">
                        Featured
                      </Badge>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-1">{ad.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{ad.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <Badge variant="outline">{ad.serviceCategory}</Badge>
                    </CardContent>
                    <CardFooter className="pt-0 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between w-full">
                        <span>by {ad.advertiser.name}</span>
                        {ad.viewsCount !== undefined && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {ad.viewsCount}
                          </div>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Ads Tab */}
          <TabsContent value="my-ads" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Advertisements</h2>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Ad
              </Button>
            </div>

            {myAds.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No ads yet</h3>
                <p className="text-muted-foreground mb-4">Start promoting your services today</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ad
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myAds.map((ad) => (
                  <Card key={ad.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{ad.title}</CardTitle>
                          <CardDescription>{ad.serviceCategory}</CardDescription>
                        </div>
                        <Badge variant={
                          ad.status === 'active' ? 'default' :
                          ad.status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {ad.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Views</p>
                          <p className="font-semibold flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {ad.viewsCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Clicks</p>
                          <p className="font-semibold flex items-center gap-1">
                            <MousePointer className="h-4 w-4" />
                            {ad.clicksCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Duration</p>
                          <p className="font-semibold">{ad.duration} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Created</p>
                          <p className="font-semibold">
                            {new Date(ad.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      {ad.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAd(ad);
                            setShowAnalytics(true);
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Select the duration that works best for your advertising needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {AD_DURATIONS.map((plan) => (
                <Card key={plan.days} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  {plan.days === 90 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-600">Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.label}</CardTitle>
                    <CardDescription>{plan.days} days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">₹{plan.price}</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Featured placement
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Analytics dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        View & click tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Community visibility
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setShowCreateDialog(true)}>
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Why Advertise With Us?</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">🎯 Targeted Reach</h3>
                  <p className="text-sm text-muted-foreground">
                    Reach thousands of residents in your community who are actively looking for services
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">📊 Track Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor views, clicks, and engagement with detailed analytics
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">💼 Build Trust</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with neighbors who trust local service providers
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ad Detail Dialog */}
        {selectedAd && !showAnalytics && (
          <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedAd.title}</DialogTitle>
                <DialogDescription>
                  {selectedAd.serviceCategory} • by {selectedAd.advertiser.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedAd.imageUrl && (
                  <div className="relative h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedAd.imageUrl}
                      alt={selectedAd.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">About This Service</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedAd.description}</p>
                </div>

                {selectedAd.servicePageContent && (
                  <div>
                    <h3 className="font-semibold mb-2">Service Details</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{selectedAd.servicePageContent}</p>
                    </div>
                  </div>
                )}

                {selectedAd.pricing && (
                  <div>
                    <h3 className="font-semibold mb-2">Pricing</h3>
                    <p className="text-muted-foreground">{selectedAd.pricing}</p>
                  </div>
                )}

                {selectedAd.contactInfo && (
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedAd.contactInfo}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    trackClickMutation.mutate(selectedAd.id);
                    toast({
                      title: "Contact Info",
                      description: selectedAd.contactInfo || "Please contact the advertiser"
                    });
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Contact Advertiser
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Analytics Dialog */}
        {selectedAd && showAnalytics && (
          <AnalyticsDialog
            ad={selectedAd}
            open={showAnalytics}
            onOpenChange={(open) => {
              setShowAnalytics(open);
              if (!open) setSelectedAd(null);
            }}
          />
        )}

        {/* Create Ad Dialog */}
        <CreateAdDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </div>
  );
}

function AnalyticsDialog({ ad, open, onOpenChange }: { ad: Advertisement; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, idToken } = useAuth();
  const { data: analytics } = useQuery({
    queryKey: [`/api/advertisements/${ad.id}/analytics`],
    queryFn: async () => {
      const response = await fetch(`/api/advertisements/${ad.id}/analytics`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: open
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Analytics for "{ad.title}"</DialogTitle>
          <DialogDescription>
            Performance metrics for your advertisement
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.viewsCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.clicksCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Click Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.viewsCount > 0 
                  ? ((analytics.clicksCount / analytics.viewsCount) * 100).toFixed(1)
                  : 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Days Active</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ad.startDate 
                  ? Math.ceil((new Date().getTime() - new Date(ad.startDate).getTime()) / (1000 * 60 * 60 * 24))
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Ad Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Status</p>
              <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                {ad.status}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Duration</p>
              <p>{ad.duration} days</p>
            </div>
            {ad.startDate && (
              <div>
                <p className="text-muted-foreground mb-1">Start Date</p>
                <p>{new Date(ad.startDate).toLocaleDateString()}</p>
              </div>
            )}
            {ad.endDate && (
              <div>
                <p className="text-muted-foreground mb-1">End Date</p>
                <p>{new Date(ad.endDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateAdDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, idToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceCategory: "",
    servicePageContent: "",
    pricing: "",
    contactInfo: "",
    duration: 30
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState(AD_DURATIONS[1]);

  const createAdMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/advertisements", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`
        },
        body: data
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create ad");
      }
      return response.json();
    },
    onSuccess: (ad) => {
      toast({
        title: "Ad Created!",
        description: "Processing payment..."
      });
      initiatePayment(ad.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const initiatePayment = async (advertisementId: string) => {
    try {
      const keyResponse = await fetch("/api/razorpay/key");
      const { key } = await keyResponse.json();

      const orderResponse = await fetch("/api/advertisements/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          advertisementId,
          amount: selectedPlan.price,
          duration: selectedPlan.days
        })
      });

      if (!orderResponse.ok) throw new Error("Failed to create order");
      
      const { orderId, amount, currency, paymentId } = await orderResponse.json();

      const options = {
        key,
        amount,
        currency,
        name: "My Society",
        description: `Advertisement - ${selectedPlan.label}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/advertisements/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`
              },
              body: JSON.stringify({
                paymentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyResponse.ok) throw new Error("Payment verification failed");

            queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
            toast({
              title: "Payment Successful!",
              description: "Your ad is now live"
            });
            onOpenChange(false);
            resetForm();
          } catch (error: any) {
            toast({
              title: "Verification Failed",
              description: error.message,
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: user?.displayName || "",
          email: user?.email || ""
        },
        theme: {
          color: "#3399cc"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      title: "",
      description: "",
      serviceCategory: "",
      servicePageContent: "",
      pricing: "",
      contactInfo: "",
      duration: 30
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("serviceCategory", formData.serviceCategory);
    data.append("servicePageContent", formData.servicePageContent);
    data.append("pricing", formData.pricing);
    data.append("contactInfo", formData.contactInfo);
    data.append("duration", selectedPlan.days.toString());
    
    if (selectedFile) {
      data.append("image", selectedFile);
    }

    createAdMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Advertisement</DialogTitle>
          <DialogDescription>
            Step {step} of 3 - {step === 1 ? "Ad Details" : step === 2 ? "Choose Plan" : "Review & Pay"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Ad Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Professional Yoga Classes, Home Chef Services, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of your service..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="serviceCategory">Service Category *</Label>
              <Select
                value={formData.serviceCategory}
                onValueChange={(value) => setFormData({ ...formData, serviceCategory: value })}
              >
                <SelectTrigger id="serviceCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="servicePageContent">Detailed Service Information</Label>
              <Textarea
                id="servicePageContent"
                value={formData.servicePageContent}
                onChange={(e) => setFormData({ ...formData, servicePageContent: e.target.value })}
                placeholder="Provide detailed information about your services, experience, certifications, etc."
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="pricing">Pricing Details *</Label>
              <Input
                id="pricing"
                value={formData.pricing}
                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                placeholder="₹500/hour, ₹5000/month, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <Textarea
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="Phone, email, or how people can reach you..."
                rows={2}
                required
              />
            </div>

            <div>
              <Label>Service Image (Optional)</Label>
              <div className="mt-2">
                {previewUrl && (
                  <div className="relative group mb-3">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {!previewUrl && (
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Select Advertisement Duration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AD_DURATIONS.map((plan) => (
                <Card
                  key={plan.days}
                  className={`cursor-pointer transition-all ${
                    selectedPlan.days === plan.days
                      ? 'border-primary border-2 shadow-lg'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.label}</CardTitle>
                        <CardDescription>{plan.days} days</CardDescription>
                      </div>
                      {plan.days === 90 && (
                        <Badge className="bg-green-600">Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">₹{plan.price}</div>
                    <p className="text-sm text-muted-foreground">
                      ≈ ₹{Math.round(plan.price / plan.days)}/day
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Review Your Advertisement</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{formData.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{formData.serviceCategory}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{formData.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pricing</p>
                <p className="font-medium">{formData.pricing}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Plan</p>
                <p className="font-medium">{selectedPlan.label} - ₹{selectedPlan.price}</p>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Advertisement ({selectedPlan.label})</span>
                  <span className="font-semibold">₹{selectedPlan.price}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{selectedPlan.price}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                step === 1 && (!formData.title || !formData.description || !formData.serviceCategory || !formData.pricing || !formData.contactInfo)
              }
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createAdMutation.isPending}>
              <CreditCard className="h-4 w-4 mr-2" />
              {createAdMutation.isPending ? "Processing..." : "Proceed to Payment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
