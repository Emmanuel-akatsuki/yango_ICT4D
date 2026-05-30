import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import FileSystem from 'react-native-fs';

// Ces constantes devraient normalement être dans un fichier .env
const SUPABASE_URL = 'https://votre-id.supabase.co';
const SUPABASE_KEY = 'votre-cle-anon';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface Project {
  id: string;
  name: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  user_id: string;
}

export const uploadMedia = async (fileUri: string, fileName: string): Promise<string | null> => {
  try {
    // Lecture du fichier en base64 pour l'upload (requis pour React Native / Supabase)
    const base64 = await FileSystem.readFile(fileUri, 'base64');
    const filePath = `uploads/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from('media_projects')
      .upload(filePath, decode(base64), {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('media_projects')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Erreur Upload Supabase:', error);
    return null;
  }
};

export const saveProject = async (userId: string, projectName: string, videoUrl: string) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      { user_id: userId, name: projectName, video_url: videoUrl }
    ])
    .select();

  if (error) throw error;
  return data[0];
};

export const fetchUserProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};