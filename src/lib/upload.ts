import api from '@/api/axios';

export type UploadType = 'photo' | 'gallery' | 'music' | 'template-preview' | 'default-photo' | 'default-music' | 'default-video';

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Validate a photo file.
 * Returns error message string if invalid, null if valid.
 */
export const validatePhoto = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return 'Only JPG, PNG, and WebP images are allowed';
  }

  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `Photo must be under 5MB (this file is ${sizeMB}MB)`;
  }

  return null;
};

/**
 * Validate a music file.
 * Returns error message string if invalid, null if valid.
 */
export const validateMusic = (file: File): string | null => {
  const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return 'Only MP3 and M4A files are allowed';
  }

  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `Music file must be under 10MB (this file is ${sizeMB}MB)`;
  }

  return null;
};

/**
 * Validate a video file.
 * Returns error message string if invalid, null if valid.
 */
export const validateVideo = (file: File): string | null => {
  const validTypes = ['video/mp4', 'video/webm'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    return 'Only MP4 and WebM videos are allowed';
  }

  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `Video must be under 50MB (this file is ${sizeMB}MB)`;
  }

  return null;
};

/**
 * Get a presigned URL from the backend for direct R2 upload.
 */
export const getPresignedUrl = async (
  file: File,
  uploadType: string,
  templateId?: number
): Promise<PresignedUrlResponse> => {
  const { data } = await api.post('/api/upload/presign', {
    fileName: file.name,
    fileType: file.type,
    uploadType,
    ...(templateId != null && { templateId }),
  });
  return data;
};

/**
 * Upload a file directly to R2/S3 using a presigned URL.
 * Uses XMLHttpRequest for progress tracking.
 */
export const uploadToR2 = (
  file: File,
  uploadUrl: string,
  onProgress?: (pct: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
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
      reject(new Error('Network error during upload'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * Complete upload flow: get presigned URL → upload to R2 → return publicUrl.
 * This is the main function components should call.
 */
export const uploadFile = async (
  file: File,
  uploadType: string,
  onProgress?: (pct: number) => void,
  templateId?: number
): Promise<string> => {
  const { uploadUrl, publicUrl } = await getPresignedUrl(file, uploadType, templateId);
  await uploadToR2(file, uploadUrl, onProgress);
  return publicUrl;
};
