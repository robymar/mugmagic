export type ProductCategory = 'mug' | 'bottle' | 'plate' | 'accessories';

// Legacy variant type (JSONB)
export interface ProductVariantLegacy {
    id: string;
    name: string;
    color: string;
    hexCode: string;
    priceModifier: number;
    image?: string;
}

// New table-based variant type
export interface ProductVariant {
    id: string;
    product_id: string;
    sku_code: string;
    name: string;
    price: number;
    stock_quantity: number;
    attributes: {
        color?: string;
        hexCode?: string;
        image?: string;
        size?: string;
        material?: string;
        [key: string]: any;
    };
    is_available: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

// Stock reservation type
export interface StockReservation {
    id: string;
    variant_id: string;
    quantity: number;
    checkout_id: string;
    user_id?: string;
    status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
    expires_at: string;
    created_at: string;
    updated_at: string;
}

export interface ProductSpecifications {
    capacity?: string;
    dimensions: {
        width: number;
        height: number;
        diameter: number;
    };
    weight?: string;
    material: string;
    printableArea: {
        width: number;
        height: number;
    };
    dishwasherSafe: boolean;
    microwaveSafe: boolean;
}

export interface ProductImages {
    thumbnail: string;
    gallery: string[];
    model3D?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    longDescription?: string;
    category: ProductCategory;
    basePrice: number;
    compareAtPrice?: number; // For showing discounts
    images: ProductImages;
    specifications: ProductSpecifications;
    variants?: ProductVariant[]; // Now references table-based variants
    variantsLegacy?: ProductVariantLegacy[]; // For backward compatibility during migration
    tags: string[];
    inStock: boolean;
    stockQuantity?: number; // Deprecated: Use variant stock instead
    featured: boolean;
    bestseller?: boolean;
    new?: boolean;
    rating?: number;
    reviewCount?: number;
    customizable?: boolean;
}

export interface CartProduct extends Product {
    quantity: number;
    selectedVariant?: ProductVariant;
    customizationData?: {
        designId: string;
        previewUrl: string;
    };
}
