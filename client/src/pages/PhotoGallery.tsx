import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Heart, Image, Plus, Calendar, Users, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import UploadGalleryDialog from "@/components/UploadGalleryDialog";
import PhotoLightbox from "@/components/PhotoLightbox";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

interface Gallery {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  likeCount: number;
  imageCount: number;
  createdAt: string;
  creator: {
    id: string;
    fullName: string;
    profilePhotoUrl: string | null;
  };
  coverImage?: {
    imageUrl: string;
  } | null;
  images?: GalleryImage[];
  isLiked?: boolean;
}

interface PhotoGalleryProps {
  userId?: string;
  idToken?: string;
}

export default function PhotoGallery({ userId, idToken }: PhotoGalleryProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data, isLoading } = useQuery<{ galleries: Gallery[] }>({
    queryKey: ['/api/galleries'],
    queryFn: async () => {
      const response = await fetch('/api/galleries');
      if (!response.ok) throw new Error('Failed to fetch galleries');
      return response.json();
    },
  });

  const filteredGalleries = data?.galleries.filter((gallery) => {
    if (selectedCategory === "all") return true;
    return gallery.tags.includes(selectedCategory);
  }) || [];

  const viewGallery = async (galleryId: string) => {
    try {
      const response = await fetch(`/api/galleries/${galleryId}`);
      if (!response.ok) throw new Error('Failed to fetch gallery details');
      const galleryData = await response.json();
      setSelectedGallery(galleryData);
      setLightboxOpen(true);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "events":
        return <Calendar className="w-4 h-4" />;
      case "community":
        return <Users className="w-4 h-4" />;
      case "festivals":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Photo Galleries</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
              {userId && idToken && (
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Gallery
                </Button>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Share and explore photos from community events, festivals, and daily life
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="festivals" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Festivals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading galleries...</p>
              </div>
            ) : filteredGalleries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGalleries.map((gallery) => (
                  <Card 
                    key={gallery.id} 
                    className="overflow-hidden hover-elevate cursor-pointer group"
                    onClick={() => viewGallery(gallery.id)}
                  >
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {gallery.coverImage?.imageUrl ? (
                        <img
                          src={gallery.coverImage.imageUrl}
                          alt={gallery.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          {gallery.imageCount} {gallery.imageCount === 1 ? 'photo' : 'photos'}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-1">{gallery.title}</CardTitle>
                      {gallery.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {gallery.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={gallery.creator.profilePhotoUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {gallery.creator.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{gallery.creator.fullName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(gallery.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <Heart className="w-4 h-4" />
                          {gallery.likeCount > 0 && <span className="text-xs">{gallery.likeCount}</span>}
                        </Button>
                      </div>

                      {gallery.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {gallery.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs capitalize">
                              {getCategoryIcon(tag)}
                              <span className="ml-1">{tag}</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-semibold mb-2">No galleries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedCategory === "all" 
                      ? "Be the first to create a photo gallery!"
                      : `No ${selectedCategory} galleries found. Try another category.`}
                  </p>
                  {userId && idToken && (
                    <Button onClick={() => setUploadDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Gallery
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Gallery Dialog */}
      {userId && idToken && (
        <UploadGalleryDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          idToken={idToken}
        />
      )}

      {/* Photo Lightbox */}
      <PhotoLightbox
        gallery={selectedGallery}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        userId={userId}
        idToken={idToken}
      />
    </div>
  );
}
