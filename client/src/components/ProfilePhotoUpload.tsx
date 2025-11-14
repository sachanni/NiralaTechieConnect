import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="space-y-4">
      <Label className="text-base font-medium">Profile Photo</Label>
      <div className="flex flex-col items-center gap-6">
        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="w-40 h-40 border-4 border-white shadow-xl ring-2 ring-gray-100">
                <AvatarImage src={preview} className="object-cover" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {!uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    data-testid="button-change-photo"
                    title="Change photo"
                  >
                    <Camera className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                Change Photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`w-full max-w-md border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            data-testid="dropzone-photo"
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-gray-100'} transition-colors`}>
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : (
                  <ImageIcon className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-700">
                  {uploading ? 'Uploading photo...' : 'Upload your profile photo'}
                </p>
                {!uploading && (
                  <>
                    <p className="text-sm text-gray-500">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
              </div>
              {!uploading && (
                <Button 
                  type="button"
                  variant="default" 
                  size="sm"
                  className="mt-2 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
              )}
            </div>
          </div>
        )}

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
