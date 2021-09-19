import supabase from './supabase';

export const mimetypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
};

export function getExt(fileName) {
  return fileName.split('.').pop()!.toLowerCase();
}

export function getMimetype(fileName) {
  return mimetypes[getExt(fileName)];
}

export function arrayDataToBlob(imageData, fileName) {
  const mime = getMimetype(fileName);
  return new Blob([imageData], {
    type: mime,
  });
}

export async function updateProfile(avatarData, userId) {
  const fileName = `${userId}.png`;
  // Convert to blob and upload
  const blob = arrayDataToBlob(avatarData, fileName);
  const {error} = await supabase.storage.from('avatars').upload(fileName, blob);
  if (error) {
    throw error;
  }
  return await supabase.postgrest.from('profiles').insert([
    {
      id: userId,
      avatar_url: fileName,
    },
  ]);
}
