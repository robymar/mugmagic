export type ProductCategory = 'mug' | 'bottle' | 'plate' | 'accessories';

export interface ProductVariant {
    id: string;
    name: string;
    color: string;
    hexCode: string;
    priceModifier: number;
    image?: string;
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
    variants?: ProductVariant[];
    tags: string[];
    inStock: boolean;
    featured: boolean;
    bestseller?: boolean;
    new?: boolean;
    rating?: number;
    reviewCount?: number;
}

export interface CartProduct extends Product {
    quantity: number;
    selectedVariant?: ProductVariant;
    customizationData?: {
        designId: string;
        previewUrl: string;
    };
}
