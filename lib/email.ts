import { Resend } from 'resend';

// Initialize Resend with API key
// If no key is provided, it will throw an error when trying to send
export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = 'MugMagic <orders@mugmagic.com>'; // Update with verified domain in production
