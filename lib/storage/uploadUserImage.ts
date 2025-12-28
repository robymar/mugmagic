import { createClient } from '@/utils/supabase/client';

/**
 * Upload a user-provided image to Supabase Storage (stickers bucket)
 * @param file - The image file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadUserImage(file: File): Promise<string> {
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

    // Generate unique filename in 'uploads' folder to separate from admin stickers
    // Format: uploads/[timestamp]-[random].[ext]
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to storage
    const { data, error } = await supabase.storage
        .from('stickers') // We reuse stickers bucket which is public
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
