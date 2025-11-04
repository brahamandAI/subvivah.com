import { useState } from 'react';
import { Camera, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface PhotoUploadProps {
  onUploadComplete?: () => void;
  isProfile?: boolean;
}

export default function PhotoUpload({ onUploadComplete, isProfile = false }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isProfile', isProfile.toString());

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      if (onUploadComplete) {
        onUploadComplete();
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="photo-upload"
      />
      <label
        htmlFor="photo-upload"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200
          ${uploading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : success
              ? 'bg-green-100 text-green-700'
              : error
                ? 'bg-red-100 text-red-700'
                : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-md'
          }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Uploading...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Success!</span>
          </>
        ) : error ? (
          <>
            <XCircle className="w-4 h-4" />
            <span className="text-xs">Failed</span>
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            <span className="text-xs">Change Photo</span>
          </>
        )}
      </label>
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
} 