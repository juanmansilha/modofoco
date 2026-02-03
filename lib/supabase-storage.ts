import { supabase } from './supabase';

/**
 * Uploads a user avatar to Supabase Storage and returns the public URL.
 * File is stored as `avatars/{userId}-{timestamp}.ext` to avoid caching issues.
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // 1. Upload the file
        const { error: uploadError } = await supabase.storage
            .from('images') // Using 'images' bucket as it's commonly used/default
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            // Try 'avatars' bucket if 'images' fails
            const { error: retryError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (retryError) throw retryError;
        }

        // 2. Get Public URL
        // Try getting from 'images' first, assuming that's where we uploaded
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        // Simple validation if url seems valid, otherwise check 'avatars'
        if (publicUrl) return publicUrl;

        const { data: { publicUrl: avatarUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return avatarUrl;

    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
}
