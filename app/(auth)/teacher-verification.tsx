import { supabase } from '../../src/lib/supabase';

// Helper to decode base64 string to ArrayBuffer in React Native
const decodeBase64 = (base64: string): ArrayBuffer => {
  const cleanBase64 = base64.replace(/\s/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = cleanBase64.length * 0.75;
  if (cleanBase64.endsWith('==')) {
    bufferLength -= 2;
  } else if (cleanBase64.endsWith('=')) {
    bufferLength -= 1;
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < cleanBase64.length; i += 4) {
    const encoded1 = lookup[cleanBase64.charCodeAt(i)];
    const encoded2 = lookup[cleanBase64.charCodeAt(i + 1)];
    const encoded3 = lookup[cleanBase64.charCodeAt(i + 2)];
    const encoded4 = lookup[cleanBase64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
};

export const submitTeacherVerification = async (
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  userGoals: string[],
  role: string,
  institution: string,
  prcNumber: string,
  imageBase64: string,
  imageName: string,
  imageMimeType: string
) => {
  // 1. Upload the ID image to Supabase Storage bucket 'teacher-ids'
  const arrayBuffer = decodeBase64(imageBase64);
  const uniqueFilePath = `${userId}/${Date.now()}_${imageName}`;

  const { error: uploadError } = await supabase.storage
    .from('teacher-ids')
    .upload(uniqueFilePath, arrayBuffer, {
      contentType: imageMimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`ID image upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('teacher-ids')
    .getPublicUrl(uniqueFilePath);

  const idImageUrl = publicUrlData.publicUrl;

  // 2. Upsert into profiles table with id_image_url
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      goals: userGoals,
      role,
      university: institution,
      prc_number: prcNumber,
      id_image_url: idImageUrl,
      is_verified: false,
    });

  if (profileError) {
    throw new Error(`Error saving profile details: ${profileError.message}`);
  }

  // 3. Sign out immediately to clear the auto-logged in session
  await supabase.auth.signOut();
};