import { createClient } from '@/utils/supabase/client';

/**
 * Upload a sticker file to Supabase Storage
 * @param file - The image file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadStickerFile(file: File): Promise<string> {
    const supabase = createClient();

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload PNG, JPG, SVG, or WebP');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to storage
    const { data, error } = await supabase.storage
        .from('stickers')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('stickers')
        .getPublicUrl(fileName);

    return publicUrl;
}

/**
 * Delete a sticker file from Supabase Storage
 * @param url - The public URL of the file to delete
 */
export async function deleteStickerFile(url: string): Promise<void> {
    const supabase = createClient();

    // Extract filename from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/stickers/[filename]
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
        console.error('Could not extract filename from URL:', url);
        return;
    }

    const { error } = await supabase.storage
        .from('stickers')
        .remove([fileName]);

    if (error) {
        console.error('Storage delete error:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
}
