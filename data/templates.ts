export interface Template {
    id: string;
    title: string;
    description: string;
    category: 'holidays' | 'quotes' | 'abstract' | 'minimal';
    thumbnail: string;
    baseProductId: string; // The product this template is designed for (e.g., mug-11oz)
    designData: {
        text?: string;
        textColor?: string;
        fontFamily?: string;
        image?: string;
    };
}

export const TEMPLATES: Template[] = [
    {
        id: 'holiday-ho-ho-ho',
        title: 'Christmas Cheer',
        description: 'Festive holiday mug design',
        category: 'holidays',
        thumbnail: 'https://images.unsplash.com/photo-1544521750-705b058c49cc?w=400',
        baseProductId: 'mug-11oz',
        designData: {
            text: 'Ho Ho Ho!',
            textColor: '#D32F2F',
            fontFamily: 'Mountains of Christmas'
        }
    },
    {
        id: 'quote-best-dad',
        title: 'Best Dad Ever',
        description: 'Classic gift for fathers',
        category: 'quotes',
        thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
        baseProductId: 'mug-11oz',
        designData: {
            text: 'Best Dad Ever',
            textColor: '#1976D2',
            fontFamily: 'Roboto'
        }
    },
    {
        id: 'abstract-splash',
        title: 'Artistic Splash',
        description: 'Modern abstract art design',
        category: 'abstract',
        thumbnail: 'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?w=400',
        baseProductId: 'mug-11oz',
        designData: {
            text: 'Create Art',
            textColor: '#000000',
            image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400'
        }
    },
    {
        id: 'minimal-hello',
        title: 'Simple Hello',
        description: 'Clean and minimal greeting',
        category: 'minimal',
        thumbnail: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=400',
        baseProductId: 'mug-11oz',
        designData: {
            text: 'Hello.',
            textColor: '#333333',
            fontFamily: 'Inter'
        }
    }
];
