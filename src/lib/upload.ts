import api from '@/api/axios';

export type UploadType = 'photo' | 'gallery' | 'music' | 'video';

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

/**
 * Get a presigned URL for direct upload to R2/S3
 */
export const getPresignedUrl = async (
  fileName: string,
  fileType: string,
  uploadType: UploadType
): Promise<PresignedUrlResponse> => {
  const { data } = await api.post('/api/upload/presign', {
    fileName,
    fileType,
    uploadType,
  });
  return data;
};

/**
 * Upload a file directly to R2/S3 using a presigned URL
 * Uses XMLHttpRequest for progress tracking
 */
export const uploadToR2 = (
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * Complete upload flow: get presigned URL, upload file, return public URL
 */
export const uploadFile = async (
  file: File,
  uploadType: UploadType,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Check if we're in dev mode - use mock upload
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
  
  if (isDevMode) {
    // In dev mode, simulate upload and return a placeholder
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        onProgress?.(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          // Return a data URL for the file
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }, 200);
    });
  }

  // Production: use presigned URL upload
  const { uploadUrl, publicUrl } = await getPresignedUrl(
    file.name,
    file.type,
    uploadType
  );

  await uploadToR2(file, uploadUrl, onProgress);

  return publicUrl;
};

/**
 * Validate photo file
 * Returns error message or null if valid
 */
export const validatePhoto = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return 'Please upload a JPG, PNG, or WebP image';
  }

  if (file.size > maxSize) {
    return 'Image must be less than 5MB';
  }

  return null;
};

/**
 * Validate music file
 * Returns error message or null if valid
 */
export const validateMusic = (file: File): string | null => {
  const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return 'Please upload an MP3 or M4A file';
  }

  if (file.size > maxSize) {
    return 'Audio must be less than 10MB';
  }

  return null;
};

/**
 * Validate video file
 * Returns error message or null if valid
 */
export const validateVideo = (file: File): string | null => {
  const validTypes = ['video/mp4', 'video/webm'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    return 'Please upload an MP4 or WebM video';
  }

  if (file.size > maxSize) {
    return 'Video must be less than 50MB';
  }

  return null;
};
