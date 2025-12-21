import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TextureQuality = 'low' | 'medium' | 'high' | 'ultra';

interface QualitySettings {
    textureQuality: TextureQuality;
    setTextureQuality: (quality: TextureQuality) => void;
    getMultiplier: () => number;
}

const QUALITY_MULTIPLIERS: Record<TextureQuality, number> = {
    low: 1,
    medium: 1.5,
    high: 2,
    ultra: 3
};

export const useQualityStore = create<QualitySettings>()(
    persist(
        (set, get) => ({
            textureQuality: 'high',

            setTextureQuality: (quality) => {
                console.log(`[Quality] Texture quality set to: ${quality}`);
                set({ textureQuality: quality });
            },

            getMultiplier: () => {
                const quality = get().textureQuality;
                return QUALITY_MULTIPLIERS[quality];
            }
        }),
        {
            name: 'mugmagic-quality-settings'
        }
    )
);
