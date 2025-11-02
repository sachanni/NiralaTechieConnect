import { useState } from "react";
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
import { Calendar } from "../components/ui/calendar";
import { useToast } from "../hooks/use-toast";
import { Search, Plus, Heart, MapPin, Tag, Wrench, Calendar as CalendarIcon, Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, isAfter, isBefore } from "date-fns";

interface RentalItem {
  id: string;
  name: string;
  description: string;
  category: string;
  dailyRate: number;
  deposit: number;
  images: string[];
  availability: string;
  location: string;
  owner: {
    id: string;
    name: string;
    location: string;
  };
  createdAt: string;
  isFavorited?: boolean;
  bookingsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
}

const RENTAL_CATEGORIES = [
  "Power Tools",
  "Hand Tools",
  "Gardening Equipment",
  "Cleaning Equipment",
  "Ladders & Scaffolding",
  "Painting Supplies",
  "Plumbing Tools",
  "Electrical Tools",
  "Moving Equipment",
  "Party & Event",
  "Sports Equipment",
  "Other"
];

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available Now" },
  { value: "booked", label: "Currently Booked" },
  { value: "maintenance", label: "Under Maintenance" }
];

export default function ToolRental() {
  const { user, idToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: items = [], isLoading } = useQuery<RentalItem[]>({
    queryKey: ["/api/rentals", selectedCategory, selectedAvailability],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedAvailability !== "all") params.append("availability", selectedAvailability);
      
      const response = await fetch(`/api/rentals?${params}`, {
        headers: user ? {
          'Authorization': `Bearer ${idToken}`
        } : {}
      });
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/rentals/${itemId}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        }
      });
      if (!response.ok) throw new Error("Failed to toggle favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      toast({
        title: "Updated!",
        description: "Favorite status updated"
      });
    }
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleNextImage = () => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedItem.images.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedItem.images.length) % selectedItem.images.length);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Tool & Equipment Rental</h1>
          <p className="text-muted-foreground">Rent or lend tools and equipment within your community</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools and equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {user && (
              <Button onClick={() => setShowPostDialog(true)} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                List Your Item
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
                {RENTAL_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                {AVAILABILITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden md:block text-sm text-muted-foreground self-center">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>

        {/* Items Grid */}
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
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            {user && (
              <Button onClick={() => setShowPostDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                List Your First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => {
                  setSelectedItem(item);
                  setCurrentImageIndex(0);
                }}
              >
                <div className="relative h-48 bg-muted overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wrench className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <Badge 
                    className="absolute top-2 left-2"
                    variant={item.availability === 'available' ? 'default' : 'secondary'}
                  >
                    {item.availability}
                  </Badge>
                  {user && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMutation.mutate(item.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${item.isFavorited ? 'fill-current text-red-500' : ''}`} />
                    </Button>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{item.dailyRate}</p>
                      <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Deposit: ₹{item.deposit}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.owner.name} • {item.owner.location}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Item Detail Dialog */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  Listed by {selectedItem.owner.name} • {new Date(selectedItem.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Image Gallery */}
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="relative">
                    <div className="relative h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={selectedItem.images[currentImageIndex]}
                        alt={selectedItem.name}
                        className="w-full h-full object-contain"
                      />
                      {selectedItem.images.length > 1 && (
                        <>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute left-2 top-1/2 -translate-y-1/2"
                            onClick={handlePrevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={handleNextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {selectedItem.images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${
                                  idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Daily Rate</p>
                    <p className="font-semibold text-lg">₹{selectedItem.dailyRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Deposit</p>
                    <p className="font-semibold text-lg">₹{selectedItem.deposit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <p className="font-semibold">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Availability</p>
                    <Badge variant={selectedItem.availability === 'available' ? 'default' : 'secondary'}>
                      {selectedItem.availability}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="whitespace-pre-wrap">{selectedItem.description}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Location</p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedItem.location}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {user && user.uid !== selectedItem.owner.id && selectedItem.availability === 'available' && (
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setShowBookingDialog(true);
                    }}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Booking Dialog */}
        {selectedItem && showBookingDialog && (
          <BookingDialog
            item={selectedItem}
            open={showBookingDialog}
            onOpenChange={(open) => {
              setShowBookingDialog(open);
              if (!open) setSelectedItem(null);
            }}
          />
        )}

        {/* Post Item Dialog */}
        <PostRentalDialog 
          open={showPostDialog} 
          onOpenChange={setShowPostDialog}
        />
      </div>
    </div>
  );
}

function BookingDialog({ item, open, onOpenChange }: { item: RentalItem; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, idToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState("");

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/rentals/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      toast({
        title: "Booking Created!",
        description: "Your rental booking has been submitted"
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days * item.dailyRate;
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return;
    }

    bookingMutation.mutate({
      itemId: item.id,
      ownerId: item.owner.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book {item.name}</DialogTitle>
          <DialogDescription>
            Select your rental dates and confirm booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => isBefore(date, new Date())}
                className="rounded-md border"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => !startDate || isBefore(date, startDate)}
                className="rounded-md border"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or notes for the owner..."
              rows={3}
            />
          </div>

          {startDate && endDate && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <span className="font-semibold">₹{item.dailyRate}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of Days:</span>
                <span className="font-semibold">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Deposit:</span>
                <span className="font-semibold">₹{item.deposit}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold">₹{calculateTotal() + item.deposit}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={bookingMutation.isPending || !startDate || !endDate}>
            {bookingMutation.isPending ? "Creating..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostRentalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, idToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    dailyRate: "",
    deposit: "",
    location: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const postItemMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`
        },
        body: data
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      toast({
        title: "Success!",
        description: "Your rental item has been listed"
      });
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        category: "",
        dailyRate: "",
        deposit: "",
        location: ""
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload up to 10 images",
        variant: "destructive"
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("dailyRate", formData.dailyRate);
    data.append("deposit", formData.deposit);
    data.append("location", formData.location);
    
    selectedFiles.forEach(file => {
      data.append("images", file);
    });

    postItemMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List a Rental Item</DialogTitle>
          <DialogDescription>
            Share your tools and equipment with neighbors
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Drill Machine, Ladder, Lawn Mower, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the item, its features, and usage guidelines..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {RENTAL_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dailyRate">Daily Rate (₹) *</Label>
              <Input
                id="dailyRate"
                type="number"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                placeholder="Enter daily rental rate"
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="deposit">Deposit (₹) *</Label>
              <Input
                id="deposit"
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                placeholder="Security deposit amount"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Tower A, Block 12, etc."
              required
            />
          </div>

          <div>
            <Label>Images (up to 10)</Label>
            <div className="mt-2">
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {selectedFiles.length < 10 && (
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={postItemMutation.isPending}>
              {postItemMutation.isPending ? "Listing..." : "List Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
