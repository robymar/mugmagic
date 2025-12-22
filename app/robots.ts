import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/auth-debug/',
                    '/test/',
                    '/test-cookies/',
                ],
            },
        ],
        sitemap: 'https://mugmagic.com/sitemap.xml',
    };
}
