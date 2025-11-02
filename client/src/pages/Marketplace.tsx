import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { Search, Plus, Heart, MapPin, Tag, DollarSign, Package, MessageSquare, X, Upload, ChevronLeft, ChevronRight } from "lucide-react";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  images: string[];
  location: string;
  status: string;
  seller: {
    id: string;
    name: string;
    location: string;
  };
  createdAt: string;
  isFavorited?: boolean;
  offersCount?: number;
  reviewsCount?: number;
  averageRating?: number;
}

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Appliances",
  "Books",
  "Clothing",
  "Toys & Games",
  "Sports Equipment",
  "Tools",
  "Home Decor",
  "Kitchen Items",
  "Other"
];

const CONDITIONS = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "For Parts"
];

const LISTING_TYPES = [
  { value: "sell", label: "Sell" },
  { value: "exchange", label: "Exchange" },
  { value: "free", label: "Free" }
];

export default function Marketplace() {
  const { user, idToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: items = [], isLoading } = useQuery<MarketplaceItem[]>({
    queryKey: ["/api/marketplace", selectedCategory, selectedCondition, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedCondition !== "all") params.append("condition", selectedCondition);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/marketplace?${params}`, {
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
      const response = await fetch(`/api/marketplace/${itemId}/favorite`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({
        title: "Updated!",
        description: "Favorite status updated"
      });
    }
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    return matchesSearch && matchesPrice;
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
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Buy, sell, or exchange items with your neighbors</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {user && (
              <Button onClick={() => setShowPostDialog(true)} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Post Item
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {CONDITIONS.map(cond => (
                  <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
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
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            {user && (
              <Button onClick={() => setShowPostDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Item
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
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {item.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg">SOLD</Badge>
                    </div>
                  )}
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
                    <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                    <Badge variant={item.price === 0 ? "secondary" : "default"}>
                      {item.price === 0 ? "Free" : `₹${item.price.toLocaleString()}`}
                    </Badge>
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
                      {item.condition}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.seller.name} • {item.seller.location}
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
                <DialogTitle>{selectedItem.title}</DialogTitle>
                <DialogDescription>
                  Posted by {selectedItem.seller.name} • {new Date(selectedItem.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Image Gallery */}
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="relative">
                    <div className="relative h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={selectedItem.images[currentImageIndex]}
                        alt={selectedItem.title}
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
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="font-semibold">
                      {selectedItem.price === 0 ? "Free" : `₹${selectedItem.price.toLocaleString()}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <p className="font-semibold">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Condition</p>
                    <p className="font-semibold">{selectedItem.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge variant={selectedItem.status === 'available' ? 'default' : 'secondary'}>
                      {selectedItem.status}
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
                {user && user.uid !== selectedItem.seller.id && selectedItem.status === 'available' && (
                  <>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Make Offer
                    </Button>
                    <Button className="w-full sm:w-auto">
                      Contact Seller
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Post Item Dialog */}
        <PostItemDialog 
          open={showPostDialog} 
          onOpenChange={setShowPostDialog}
        />
      </div>
    </div>
  );
}

function PostItemDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, idToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    location: "",
    listingType: "sell"
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const postItemMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/marketplace", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      toast({
        title: "Success!",
        description: "Your item has been posted"
      });
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        condition: "",
        price: "",
        location: "",
        listingType: "sell"
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
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("condition", formData.condition);
    data.append("price", formData.listingType === "free" ? "0" : formData.price);
    data.append("location", formData.location);
    data.append("listingType", formData.listingType);
    
    selectedFiles.forEach(file => {
      data.append("images", file);
    });

    postItemMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post an Item</DialogTitle>
          <DialogDescription>
            List an item to sell, exchange, or give away to your neighbors
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="listingType">Listing Type</Label>
            <Select
              value={formData.listingType}
              onValueChange={(value) => setFormData({ ...formData, listingType: value })}
            >
              <SelectTrigger id="listingType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LISTING_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="iPhone 13, Sofa Set, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the item, its condition, and any other details..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(cond => (
                    <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.listingType !== "free" && (
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter price in rupees"
                min="0"
                required={formData.listingType !== "free"}
              />
            </div>
          )}

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
              {postItemMutation.isPending ? "Posting..." : "Post Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
