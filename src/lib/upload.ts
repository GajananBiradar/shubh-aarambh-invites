import api from '@/api/axios';

export type UploadType = 'photo' | 'music' | 'template-preview' | 'default-photo' | 'default-music' | 'default-video';
export type UploadStage = 'temp' | 'draft' | 'published';

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

interface UploadFileParams {
  file: File;
  uploadType: UploadType;
  onProgress?: (pct: number) => void;
  uploadStage: UploadStage;
  invitationId?: number | null;
  templateId?: number;
  sessionUUID?: string;
  oldPublicUrl?: string;
}

interface PresignedUrlParams {
  file: File;
  uploadType: UploadType;
  uploadStage: UploadStage;
  invitationId?: number | null;
  templateId?: number;
  sessionUUID?: string;
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
    return `Music must be under 10MB (this file is ${sizeMB}MB)`;
  }

  return null;
};

/**
 * Get a presigned URL from the backend for direct R2 upload.
 * Supports three-stage uploads: temp (sessionStorage-based), draft (after save), published (after publish).
 */
export const getPresignedUrl = async (params: PresignedUrlParams): Promise<PresignedUrlResponse> => {
  const { file, uploadType, uploadStage, invitationId, templateId, sessionUUID } = params;
  const jwt = localStorage.getItem('jwt');

  const { data } = await api.post('/api/upload/presign',
    {
      fileName: file.name,
      fileType: file.type,
      uploadType,
      uploadStage,
      invitationId: invitationId ?? null,
      templateId: templateId ?? null,
      sessionUUID: sessionUUID ?? null,
    },
    {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    }
  );
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
        reject(new Error(`R2 upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * Delete an old file from R2 (fire-and-forget, non-blocking).
 * Never throws or shows errors to user.
 */
export const deleteOldFile = (publicUrl: string): void => {
  const jwt = localStorage.getItem('jwt');
  
  // Fire and forget - no await, no error handling
  fetch('/api/upload/file', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ fileUrl: publicUrl }),
  }).catch(() => {
    // Silent fail - cleanup errors have zero UX impact
    console.warn('Failed to delete old file, but this is non-critical');
  });
};

/**
 * Complete upload flow: get presigned URL → upload to R2 → return publicUrl.
 * Uses uploadStage to determine folder (temp, draft, or published).
 * Optionally deletes old file after successful upload (fire-and-forget).
 * Does NOT delete temp files — they auto-expire via R2 lifecycle rule (7 days).
 */
export const uploadFile = async (params: UploadFileParams): Promise<string> => {
  const { file, uploadType, onProgress, uploadStage, invitationId, templateId, sessionUUID, oldPublicUrl } = params;

  // Get presigned URL with stage
  const { uploadUrl, publicUrl } = await getPresignedUrl({
    file,
    uploadType,
    uploadStage,
    invitationId,
    templateId,
    sessionUUID,
  });

  // Upload to R2
  await uploadToR2(file, uploadUrl, onProgress);

  // Delete old file in background (fire and forget)
  // BUT: Do NOT delete temp files — they auto-expire via R2 lifecycle
  if (oldPublicUrl) {
    const isOldFileTemp = oldPublicUrl.includes('/temp/');
    if (!isOldFileTemp) {
      deleteOldFile(oldPublicUrl);
    }
  }

  return publicUrl;
};

/**
 * Format bytes to human-readable file size string.
 * Examples: 1536 → "1.5 KB", 5242880 → "5 MB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1));

  return `${value} ${sizes[i]}`;
};
