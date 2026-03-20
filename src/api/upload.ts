import api from './axios';

export const uploadPhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/api/upload/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};

export const uploadMusic = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/api/upload/music', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};
