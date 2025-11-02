import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { X, ChevronLeft, ChevronRight, Heart, Calendar, Users, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  createdAt: string;
  creator: {
    id: string;
    fullName: string;
    profilePhotoUrl: string | null;
  };
  images?: GalleryImage[];
  isLiked?: boolean;
}

interface PhotoLightboxProps {
  gallery: Gallery | null;
  initialImageIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  idToken?: string;
}

export default function PhotoLightbox({
  gallery,
  initialImageIndex = 0,
  open,
  onOpenChange,
  userId,
  idToken,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setCurrentIndex(initialImageIndex);
  }, [initialImageIndex, gallery]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, gallery]);

  const goToPrevious = () => {
    if (!gallery || !gallery.images) return;
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : gallery.images!.length - 1));
  };

  const goToNext = () => {
    if (!gallery || !gallery.images) return;
    setCurrentIndex(prev => (prev < gallery.images!.length - 1 ? prev + 1 : 0));
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!gallery || !idToken) return;
      
      const method = gallery.isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/galleries/${gallery.id}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to update like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/galleries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    },
  });

  if (!gallery || !open || !gallery.images || gallery.images.length === 0) return null;

  const currentImage = gallery.images[currentIndex];
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "events":
        return <Calendar className="w-3 h-3" />;
      case "community":
        return <Users className="w-3 h-3" />;
      case "festivals":
        return <Sparkles className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-black/95 border-0">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-start justify-between text-white">
              <div className="flex-1 pr-4">
                <h2 className="text-lg font-semibold mb-1">{gallery.title}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={gallery.creator.profilePhotoUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {gallery.creator.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{gallery.creator.fullName}</span>
                  <span className="text-xs text-white/70">
                    {formatDistanceToNow(new Date(gallery.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {gallery.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {gallery.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs capitalize bg-white/20 text-white border-0">
                        {getCategoryIcon(tag)}
                        <span className="ml-1">{tag}</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center p-16">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.caption || gallery.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Navigation Arrows */}
          {gallery.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex-1">
                {currentImage.caption && (
                  <p className="text-sm mb-2">{currentImage.caption}</p>
                )}
                <p className="text-xs text-white/70">
                  Photo {currentIndex + 1} of {gallery.images.length}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {userId && idToken && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending}
                    className={`text-white hover:bg-white/20 ${gallery.isLiked ? 'text-red-400' : ''}`}
                  >
                    <Heart className={`w-4 h-4 mr-1.5 ${gallery.isLiked ? 'fill-current' : ''}`} />
                    {gallery.likeCount}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip (Mobile Hidden) */}
          {gallery.images.length > 1 && (
            <div className="hidden md:block absolute bottom-20 left-0 right-0 z-10">
              <div className="flex gap-2 justify-center overflow-x-auto px-4 pb-2 scrollbar-thin scrollbar-thumb-white/20">
                {gallery.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all ${
                      index === currentIndex
                        ? 'ring-2 ring-white scale-110'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
