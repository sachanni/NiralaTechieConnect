import { useState } from 'react';
import ProfilePhotoUpload from '../ProfilePhotoUpload';

export default function ProfilePhotoUploadExample() {
  const [photo, setPhoto] = useState<string | null>(null);
  
  return (
    <div className="p-6 max-w-md">
      <ProfilePhotoUpload 
        value={photo} 
        onChange={setPhoto}
        userName="John Doe"
      />
    </div>
  );
}
