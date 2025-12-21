"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric'; // v6 style import
import { useDesignStore } from '@/stores/designStore';

// In Next.js, fabric might not be available on server
// We need to ensure this runs only on client
const EditorCanvas = () => {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { setCanvas, canvas, mugColor } = useDesignStore();
    const [isReady, setIsReady] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Ensure we're on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initialize Canvas
    useEffect(() => {
        if (!isMounted || !canvasEl.current || !containerRef.current) return;

        console.log('[EditorCanvas] Initializing Fabric canvas...');

        // Get container dimensions or use fallback
        const containerWidth = containerRef.current.clientWidth || 500;
        const containerHeight = containerRef.current.clientHeight || 500;

        console.log(`[EditorCanvas] Container dimensions: ${containerWidth}x${containerHeight}`);

        // Create fabric canvas with EXPLICIT dimensions
        const fabricCanvas = new fabric.Canvas(canvasEl.current, {
            width: containerWidth,
            height: containerHeight,
            backgroundColor: mugColor,  // Use mug color from store
            preserveObjectStacking: true,
        });

        console.log(`[EditorCanvas] Fabric canvas created with dimensions: ${fabricCanvas.width}x${fabricCanvas.height}`);

        // Initial setup
        setCanvas(fabricCanvas);
        setIsReady(true);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current || !fabricCanvas) return;
            const newWidth = containerRef.current.clientWidth || 500;
            const newHeight = containerRef.current.clientHeight || 500;

            fabricCanvas.setDimensions({
                width: newWidth,
                height: newHeight
            });
            fabricCanvas.renderAll();
            console.log(`[EditorCanvas] Canvas resized to: ${newWidth}x${newHeight}`);
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            // Cleanup
            console.log('[EditorCanvas] Cleaning up canvas...');
            resizeObserver.disconnect();
            fabricCanvas.dispose();
        };
    }, [isMounted, setCanvas, mugColor]);

    // Update canvas background when mugColor changes
    useEffect(() => {
        if (canvas && mugColor) {
            canvas.backgroundColor = mugColor;
            canvas.requestRenderAll();
        }
    }, [mugColor, canvas]);

    // Handle Keyboard Shortcuts (Delete/Backspace)
    useEffect(() => {
        if (!isMounted) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only if canvas is active/focused or generally available
            // We want to avoid deleting if user is typing in an input, but the canvas doesn't steal focus easily.
            // Check if active element is an input
            const activeTag = document.activeElement?.tagName.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea') return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                useDesignStore.getState().deleteSelected();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMounted]);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner relative">
            <canvas ref={canvasEl} className="w-full h-full" />
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 opacity-50 z-10">
                    Loading Editor...
                </div>
            )}
        </div>
    );
};

export default EditorCanvas;
