/**
 * Generates JSON-LD structured data for products.
 * Helps search engines understand and display rich snippets.
 */

import { Product } from '@/types/product';

interface StructuredDataProps {
    product: Product;
    url: string;
}

/**
 * Creates Product schema structured data for SEO.
 * 
 * @param product - Product object
 * @param url - Full URL to product page
 * @returns JSON-LD script tag
 */
export function ProductStructuredData({ product, url }: StructuredDataProps) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'description': product.description,
        'image': product.images.gallery || [],
        'sku': product.id,
        'brand': {
            '@type': 'Brand',
            'name': 'MugMagic'
        },
        'offers': {
            '@type': 'Offer',
            'url': url,
            'priceCurrency': 'EUR',
            'price': product.basePrice,
            'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'availability': product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            'itemCondition': 'https://schema.org/NewCondition'
        },
        ...(product.rating && product.reviewCount && {
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': product.rating,
                'reviewCount': product.reviewCount,
                'bestRating': 5,
                'worstRating': 1
            }
        })
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

/**
 * Creates Organization schema for homepage/about.
 */
export function OrganizationStructuredData() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'MugMagic',
        'description': 'Custom designed mugs with AI-powered personalization',
        'url': 'https://mugmagic.com',
        'logo': 'https://mugmagic.com/logo.png',
        'sameAs': [
            // Add social media links when available
        ],
        'contactPoint': {
            '@type': 'ContactPoint',
            'contactType': 'Customer Service',
            'email': 'support@mugmagic.com'
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

/**
 * Creates BreadcrumbList schema for navigation.
 */
interface BreadcrumbItem {
    name: string;
    url: string;
}

export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.url
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
