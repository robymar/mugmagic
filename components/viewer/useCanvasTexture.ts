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

                            // CORREGIDO: Cambiar a ClampToEdgeWrapping para evitar repetición
                            loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
                            loadedTexture.wrapT = THREE.ClampToEdgeWrapping;

                            // CORREGIDO: No usar offset ni repeat aquí
                            // El mapeo UV en la geometría ya maneja la posición

                            loadedTexture.needsUpdate = true; // IMPORTANTE

                            // Dispose old texture to prevent memory leaks
                            if (textureRef.current) {
                                textureRef.current.dispose();
                            }

                            textureRef.current = loadedTexture;
                            setTexture(loadedTexture);
                            console.log('[useCanvasTexture] Texture snapshot updated from DataURL');
                        },
                        undefined,
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

                    // CORREGIDO: Igual que arriba
                    loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
                    loadedTexture.wrapT = THREE.ClampToEdgeWrapping;

                    loadedTexture.needsUpdate = true; // IMPORTANTE

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
