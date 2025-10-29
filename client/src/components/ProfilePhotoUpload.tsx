import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProfilePhotoUploadProps {
  value: string | null;
  onChange: (photoUrl: string | null) => void;
  userName?: string;
  idToken: string;
}

export default function ProfilePhotoUpload({ value, onChange, userName, idToken }: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/users/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPreview(data.photoUrl);
      onChange(data.photoUrl);
      
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const getInitials = () => {
    if (!userName) return 'U';
    return userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-2">
      <Label>Profile Photo</Label>
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar className="w-32 h-32">
            <AvatarImage src={preview || undefined} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {!uploading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover-elevate"
              data-testid="button-upload-photo"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover-elevate ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-testid="dropzone-photo"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
          ) : (
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
          </p>
          {!uploading && (
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 5MB
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
          className="hidden"
          data-testid="input-file"
          disabled={uploading}
        />
      </div>
    </div>
  );
}
