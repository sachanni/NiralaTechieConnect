import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image, Calendar, Users, Sparkles } from "lucide-react";

interface UploadGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idToken: string;
}

interface ImagePreview {
  file: File;
  preview: string;
  caption: string;
}

export default function UploadGalleryDialog({
  open,
  onOpenChange,
  idToken,
}: UploadGalleryDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tags = [
    { id: "events", label: "Events", icon: Calendar },
    { id: "community", label: "Community", icon: Users },
    { id: "festivals", label: "Festivals", icon: Sparkles },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select image files only",
        variant: "destructive",
      });
      return;
    }

    const newImages: ImagePreview[] = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index].caption = caption;
      return updated;
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const createGalleryMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Create gallery
      const galleryResponse = await fetch('/api/galleries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          tags: selectedTags,
        }),
      });

      if (!galleryResponse.ok) {
        throw new Error('Failed to create gallery');
      }

      const gallery = await galleryResponse.json();

      // Step 2: Upload images
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image.file);
        formData.append(`captions[${index}]`, image.caption);
      });

      const uploadResponse = await fetch(`/api/galleries/${gallery.id}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload images');
      }

      return gallery;
    },
    onSuccess: () => {
      toast({
        title: "Gallery created!",
        description: "Your photos have been uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/galleries'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create gallery",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedTags([]);
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your gallery",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "No images",
        description: "Please add at least one image",
        variant: "destructive",
      });
      return;
    }

    createGalleryMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Photo Gallery</DialogTitle>
          <DialogDescription>
            Upload photos and create a gallery to share with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Gallery Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Diwali Celebration 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details about this gallery..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          <div>
            <Label className="mb-3 block">Categories</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => toggleTag(tag.id)}
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                  >
                    <tag.icon className="w-4 h-4" />
                    {tag.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Photos *</Label>
            
            {/* Upload area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                PNG, JPG, GIF up to 10MB each
              </p>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium">
                  {images.length} {images.length === 1 ? 'image' : 'images'} selected
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group border rounded-lg p-3 space-y-2"
                    >
                      <div className="relative aspect-video bg-muted rounded overflow-hidden">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Add a caption (optional)"
                        value={image.caption}
                        onChange={(e) => updateCaption(index, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createGalleryMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createGalleryMutation.isPending}
          >
            {createGalleryMutation.isPending ? "Creating..." : "Create Gallery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
