'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Debug Action to test connectivity
export async function debugAction(formData: FormData) {
    console.error('🚀 [Debug Action] I was clicked!');
    const cookieStore = await import('next/headers').then(m => m.cookies());
    cookieStore.set('test-cookie', 'hello-world', { secure: false });
    return { success: true };
}

export async function signInAction(formData: FormData) {
    console.error('🚀 [Action] signInAction triggered!');
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // Redirect to login with error
        redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    // 3. Important: Revalidate to update the UI
    revalidatePath('/', 'layout');

    // Session is set - now redirect to profile
    redirect('/profile');
}
