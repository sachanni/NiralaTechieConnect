import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import type { LostAndFound } from '@db/schema';

const ITEM_CATEGORIES = [
  'Electronics',
  'Documents',
  'Keys',
  'Jewelry',
  'Clothing',
  'Bags/Wallets',
  'Pet',
  'Other',
];

interface LostAndFoundPageProps {
  idToken: string;
}

export default function LostAndFoundPage({ idToken }: LostAndFoundPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery<LostAndFound[]>({
    queryKey: ['/api/lost-and-found'],
    queryFn: async () => {
      const response = await fetch('/api/lost-and-found', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/lost-and-found', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: data,
      });
      if (!response.ok) throw new Error('Failed to post item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lost-and-found'] });
      setIsDialogOpen(false);
      toast({
        title: 'Posted successfully',
        description: 'Your item has been posted to the Lost & Found board.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to post item. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const markResolvedMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/lost-and-found/${itemId}/resolve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to mark as resolved');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lost-and-found'] });
      toast({
        title: 'Marked as resolved',
        description: 'Item status updated successfully.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createItemMutation.mutate(formData);
  };

  const filteredItems = items.filter((item) => {
    const matchesType = item.type === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesType && matchesSearch && matchesCategory;
  });

  const openItems = filteredItems.filter((item) => item.status === 'open');
  const resolvedItems = filteredItems.filter((item) => item.status === 'resolved');

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
            <p className="text-muted-foreground mt-1">
              Help your neighbors find their lost items
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Post Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post Lost or Found Item</DialogTitle>
                <DialogDescription>
                  Share details about the item to help reunite it with its owner
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lost">Lost Item</SelectItem>
                      <SelectItem value="found">Found Item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Black wallet, iPhone 14, House keys"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide detailed description to help identify the item..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Where lost/found)</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Near Tower A playground, Parking lot"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Information</Label>
                  <Input
                    id="contactInfo"
                    name="contactInfo"
                    placeholder="Phone number or email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Images (optional)</Label>
                  <Input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload photos to help identify the item
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={createItemMutation.isPending}>
                  {createItemMutation.isPending ? 'Posting...' : 'Post Item'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ITEM_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lost' | 'found')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">Lost Items ({items.filter(i => i.type === 'lost' && i.status === 'open').length})</TabsTrigger>
            <TabsTrigger value="found">Found Items ({items.filter(i => i.type === 'found' && i.status === 'open').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="lost" className="space-y-4 mt-6">
            <ItemsList
              items={openItems}
              type="lost"
              onMarkResolved={(id) => markResolvedMutation.mutate(id)}
            />
            {resolvedItems.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Resolved ({resolvedItems.length})
                </h3>
                <ItemsList items={resolvedItems} type="lost" showResolved />
              </div>
            )}
          </TabsContent>

          <TabsContent value="found" className="space-y-4 mt-6">
            <ItemsList
              items={openItems}
              type="found"
              onMarkResolved={(id) => markResolvedMutation.mutate(id)}
            />
            {resolvedItems.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Resolved ({resolvedItems.length})
                </h3>
                <ItemsList items={resolvedItems} type="found" showResolved />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No {activeTab} items found. Be the first to post!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemsList({
  items,
  type,
  onMarkResolved,
  showResolved = false,
}: {
  items: LostAndFound[];
  type: 'lost' | 'found';
  onMarkResolved?: (id: string) => void;
  showResolved?: boolean;
}) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Card key={item.id} className={`p-4 md:p-6 ${showResolved ? 'opacity-60' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <Badge variant={type === 'lost' ? 'destructive' : 'default'}>
                      {type === 'lost' ? 'Lost' : 'Found'}
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                    {item.status === 'resolved' && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <p className="text-sm">{item.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                )}
                {item.contactInfo && (
                  <div className="flex items-center gap-1">
                    {item.contactInfo.includes('@') ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                    <span>{item.contactInfo}</span>
                  </div>
                )}
              </div>

              {item.images && item.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {item.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${item.title} ${idx + 1}`}
                      className="h-24 w-24 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>

            {!showResolved && onMarkResolved && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkResolved(item.id)}
                className="gap-2 self-start md:self-auto"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Resolved
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
