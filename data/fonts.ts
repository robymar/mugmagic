/**
 * Google Fonts collection for the editor
 * All fonts are available via Google Fonts CDN
 */

export interface FontOption {
    name: string;
    family: string;
    category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
    weight?: string;
    url: string;
}

export const GOOGLE_FONTS: FontOption[] = [
    // Sans-Serif Modern
    { name: 'Inter', family: 'Inter', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap' },
    { name: 'Roboto', family: 'Roboto', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap' },
    { name: 'Poppins', family: 'Poppins', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap' },
    { name: 'Montserrat', family: 'Montserrat', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap' },
    { name: 'Open Sans', family: 'Open Sans', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700;800&display=swap' },
    { name: 'Lato', family: 'Lato', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap' },
    { name: 'Raleway', family: 'Raleway', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;700;900&display=swap' },
    { name: 'Nunito', family: 'Nunito', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap' },
    { name: 'Ubuntu', family: 'Ubuntu', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap' },
    { name: 'Quicksand', family: 'Quicksand', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap' },

    // Serif Classic
    { name: 'Playfair Display', family: 'Playfair Display', category: 'serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap' },
    { name: 'Merriweather', family: 'Merriweather', category: 'serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap' },
    { name: 'Lora', family: 'Lora', category: 'serif', url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap' },
    { name: 'Crimson Text', family: 'Crimson Text', category: 'serif', url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;700&display=swap' },
    { name: 'EB Garamond', family: 'EB Garamond', category: 'serif', url: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap' },
    { name: 'Libre Baskerville', family: 'Libre Baskerville', category: 'serif', url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap' },

    // Display & Decorative
    { name: 'Bebas Neue', family: 'Bebas Neue', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap' },
    { name: 'Oswald', family: 'Oswald', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap' },
    { name: 'Anton', family: 'Anton', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Anton&display=swap' },
    { name: 'Archivo Black', family: 'Archivo Black', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap' },
    { name: 'Righteous', family: 'Righteous', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap' },
    { name: 'Fredoka One', family: 'Fredoka One', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap' },
    { name: 'Kalam', family: 'Kalam', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap' },
    { name: 'Bangers', family: 'Bangers', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Bangers&display=swap' },
    { name: 'Bungee', family: 'Bungee', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Bungee&display=swap' },
    { name: 'Titan One', family: 'Titan One', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Titan+One&display=swap' },

    // Handwriting & Script
    { name: 'Pacifico', family: 'Pacifico', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap' },
    { name: 'Dancing Script', family: 'Dancing Script', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap' },
    { name: 'Satisfy', family: 'Satisfy', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap' },
    { name: 'Great Vibes', family: 'Great Vibes', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap' },
    { name: 'Sacramento', family: 'Sacramento', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Sacramento&display=swap' },
    { name: 'Caveat', family: 'Caveat', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap' },
    { name: 'Indie Flower', family: 'Indie Flower', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap' },
    { name: 'Shadows Into Light', family: 'Shadows Into Light', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap' },

    // Bold & Impact
    { name: 'Permanent Marker', family: 'Permanent Marker', category: 'handwriting', url: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap' },
    { name: 'Alfa Slab One', family: 'Alfa Slab One', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap' },
    { name: 'Black Ops One', family: 'Black Ops One', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap' },
    { name: 'Press Start 2P', family: 'Press Start 2P', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap' },
    { name: 'Audiowide', family: 'Audiowide', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap' },

    // Monospace
    { name: 'Courier Prime', family: 'Courier Prime', category: 'monospace', url: 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap' },
    { name: 'Roboto Mono', family: 'Roboto Mono', category: 'monospace', url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap' },
    { name: 'Source Code Pro', family: 'Source Code Pro', category: 'monospace', url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap' },

    // Special & Fun
    { name: 'Lobster', family: 'Lobster', category: 'display', url: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap' },
    { name: 'Orbitron', family: 'Orbitron', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap' },
    { name: 'Russo One', family: 'Russo One', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Russo+One&display=swap' },
    { name: 'Teko', family: 'Teko', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Teko:wght@400;700&display=swap' },
    { name: 'Kanit', family: 'Kanit', category: 'sans-serif', url: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;700;900&display=swap' },
];

// Load all fonts
export const loadGoogleFonts = () => {
    // Create a combined URL with all fonts
    const fontFamilies = GOOGLE_FONTS.map(f => {
        const family = f.family.replace(/ /g, '+');
        return `family=${family}:wght@400;700;900`;
    }).join('&');

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
};

// Group fonts by category for better UI
export const getFontsByCategory = () => {
    const grouped: Record<string, FontOption[]> = {
        'sans-serif': [],
        'serif': [],
        'display': [],
        'handwriting': [],
        'monospace': []
    };

    GOOGLE_FONTS.forEach(font => {
        grouped[font.category].push(font);
    });

    return grouped;
};
