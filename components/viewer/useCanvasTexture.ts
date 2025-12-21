import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import * as fabric from 'fabric';
import { useQualityStore } from '@/stores/qualityStore';

export function useCanvasTexture(fabricCanvas: fabric.Canvas | null) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    // Keep track of the current texture to dispose it properly
    const textureRef = useRef<THREE.Texture | null>(null);
    // Track the last canvas state to avoid redundant updates
    const lastCanvasStateRef = useRef<string>('');
    // Get quality multiplier from settings
    const getMultiplier = useQualityStore((state) => state.getMultiplier);

    useEffect(() => {
        if (!fabricCanvas) {
            return;
        }

        // Debounce timeout reference
        let debounceTimer: NodeJS.Timeout | null = null;

        const updateSnapshot = () => {
            // Clear any pending update
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            // Schedule update after 150ms of inactivity
            debounceTimer = setTimeout(() => {
                try {
                    // Check if canvas state has actually changed
                    const currentState = JSON.stringify(fabricCanvas.toJSON());

                    if (currentState === lastCanvasStateRef.current) {
                        console.log('[useCanvasTexture] Canvas unchanged, skipping texture update');
                        return;
                    }

                    lastCanvasStateRef.current = currentState;

                    // Generate a high-quality image from the canvas
                    // Using a multiplier ensures the texture looks sharp on the 3D model
                    const dataUrl = fabricCanvas.toDataURL({
                        format: 'png',
                        multiplier: getMultiplier(),
                        quality: 1
                    });

                    const loader = new THREE.TextureLoader();
                    loader.load(
                        dataUrl,
                        (loadedTexture) => {
                            // Update texture settings
                            loadedTexture.colorSpace = THREE.SRGBColorSpace;

                            // Optimization: minimal filtering
                            loadedTexture.minFilter = THREE.LinearFilter;
                            loadedTexture.magFilter = THREE.LinearFilter;
                            loadedTexture.generateMipmaps = false;

                            // Center the texture on the cylinder opposite to handle
                            loadedTexture.wrapS = THREE.RepeatWrapping;
                            loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                            loadedTexture.offset.set(0.25, 0.1); // Ajustar para centrar TODO el diseño
                            loadedTexture.repeat.set(1, 0.8);  // Mostrar más de la textura (menos zoom)

                            // Dispose old texture to prevent memory leaks
                            if (textureRef.current) {
                                textureRef.current.dispose();
                            }

                            textureRef.current = loadedTexture;
                            setTexture(loadedTexture);
                            console.log('[useCanvasTexture] Texture snapshot updated from DataURL');
                        },
                        undefined, // onProgress (not needed)
                        (error) => {
                            console.error('[useCanvasTexture] Failed to load texture from DataURL:', error);
                        }
                    );

                } catch (err) {
                    console.error('[useCanvasTexture] Failed to generate snapshot:', err);
                }
            }, 150); // 150ms debounce delay
        };

        // Listen for changes
        // CRITICAL: Do NOT listen to 'after:render' as toDataURL triggers a render, causing an infinite loop.
        fabricCanvas.on('object:modified', updateSnapshot);
        fabricCanvas.on('object:added', updateSnapshot);
        fabricCanvas.on('object:removed', updateSnapshot);

        // Initial update (no debounce for first load)
        setTimeout(() => {
            try {
                const dataUrl = fabricCanvas.toDataURL({
                    format: 'png',
                    multiplier: getMultiplier(),
                    quality: 1
                });

                const loader = new THREE.TextureLoader();
                loader.load(dataUrl, (loadedTexture) => {
                    loadedTexture.colorSpace = THREE.SRGBColorSpace;
                    loadedTexture.minFilter = THREE.LinearFilter;
                    loadedTexture.magFilter = THREE.LinearFilter;
                    loadedTexture.generateMipmaps = false;

                    // Center the texture (same as update function)
                    loadedTexture.wrapS = THREE.RepeatWrapping;
                    loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                    loadedTexture.offset.set(0.25, 0.1);
                    loadedTexture.repeat.set(1, 0.8);

                    textureRef.current = loadedTexture;
                    setTexture(loadedTexture);
                    console.log('[useCanvasTexture] Initial texture loaded');
                });
            } catch (err) {
                console.error('[useCanvasTexture] Failed initial snapshot:', err);
            }
        }, 100);

        return () => {
            // Clear any pending updates
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            fabricCanvas.off('object:modified', updateSnapshot);
            fabricCanvas.off('object:added', updateSnapshot);
            fabricCanvas.off('object:removed', updateSnapshot);

            if (textureRef.current) {
                textureRef.current.dispose();
            }
        };
    }, [fabricCanvas]);

    return texture;
}
