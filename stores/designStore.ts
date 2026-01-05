import { create } from 'zustand';
import * as fabric from 'fabric';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid'; // Ensure we use the v6 import style

interface DesignState {
    canvas: fabric.Canvas | null;
    setCanvas: (canvas: fabric.Canvas) => void;
    activeObject: fabric.Object | null;
    setActiveObject: (obj: fabric.Object | null) => void;

    // Mug customization
    mugColor: string;
    setMugColor: (color: string) => void;

    // Actions
    addText: (text: string, options?: any) => void;
    addImage: (url: string) => void;
    deleteSelected: () => void;

    // Design sync
    jsonState: string;
    designName: string;
    setDesignName: (name: string) => void;

    // Product context
    product: any | null;
    setProduct: (product: any) => void;

    // DB Actions
    saveDesign: (productId: string, userId?: string) => Promise<string | null>; // Returns design ID
    loadDesign: (designId: string) => Promise<void>;
}

export const useDesignStore = create<DesignState>((set, get) => ({
    canvas: null,
    mugColor: '#ffffff', // Default white
    product: null,
    setProduct: (product) => set({ product }),
    setMugColor: (color) => set({ mugColor: color }),
    setCanvas: (canvas) => {
        const prevCanvas = get().canvas;

        // Remove listeners from previous canvas if exists
        if (prevCanvas) {
            prevCanvas.off();
        }

        set({ canvas });

        // Attach listeners
        const onSelectionCreated = (e: any) => set({ activeObject: e.selected?.[0] || null });
        const onSelectionUpdated = (e: any) => set({ activeObject: e.selected?.[0] || null });
        const onSelectionCleared = () => set({ activeObject: null });

        canvas.on('selection:created', onSelectionCreated);
        canvas.on('selection:updated', onSelectionUpdated);
        canvas.on('selection:cleared', onSelectionCleared);

        // Update state on changes
        const update = () => {
            set({ jsonState: JSON.stringify(canvas.toJSON()) });
        };

        canvas.on('object:modified', update);
        canvas.on('object:added', update);
        canvas.on('object:removed', update);
    },

    activeObject: null,
    setActiveObject: (obj) => {
        const { canvas } = get();
        if (canvas && obj) {
            canvas.setActiveObject(obj);
            canvas.requestRenderAll();
        }
        set({ activeObject: obj });
    },

    addText: (textString, options) => {
        const { canvas } = get();
        if (!canvas) return;

        const text = new fabric.IText(textString, {
            left: canvas.width ? canvas.width / 2 - 50 : 100,
            top: canvas.height ? canvas.height / 2 - 20 : 100,
            fontFamily: 'sans-serif',
            fill: '#333333',
            fontSize: 40,
            ...options // Apply options
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
    },

    addImage: (url) => {
        const { canvas } = get();
        if (!canvas) return;

        // Handle SVG loading specifically (Fabric v6)
        if (url.includes('.svg') || url.includes('dicebear')) {
            // fabric.loadSVGFromURL handles fetching internally
            fabric.loadSVGFromURL(url).then((result) => {
                // Fabric v6 returns { objects, options }
                const objects = result.objects ? result.objects.filter(o => o !== null) : [];
                const options = result.options;

                if (objects.length > 0 && options) {
                    const svgGroup = fabric.util.groupSVGElements(objects as any, options);
                    svgGroup.scaleToWidth(200);
                    canvas.add(svgGroup);
                    canvas.centerObject(svgGroup);
                    canvas.setActiveObject(svgGroup);
                    canvas.requestRenderAll();
                }
            }).catch(err => {
                console.error('Failed to load SVG:', err);
                // Fallback to image if SVG parsing fails
                fabric.Image.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
                    img.scaleToWidth(200);
                    canvas.add(img);
                    canvas.centerObject(img);
                    canvas.setActiveObject(img);
                    canvas.requestRenderAll();
                });
            });
            return;
        }

        // Using crossOrigin anonymous is critical for 3D textures later
        fabric.Image.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
            img.scaleToWidth(200);
            canvas.add(img);
            canvas.centerObject(img);
            canvas.setActiveObject(img);
            canvas.requestRenderAll();
        }).catch(err => console.error('Failed to load image:', err));
    },

    deleteSelected: () => {
        const { canvas } = get();
        if (!canvas) return;

        const active = canvas.getActiveObjects();
        if (active.length) {
            canvas.discardActiveObject();
            active.forEach((obj) => {
                canvas.remove(obj);
            });
            canvas.requestRenderAll();
        }
    },

    jsonState: '',
    designName: 'My Custom Design',
    setDesignName: (name) => set({ designName: name }),

    saveDesign: async (productId: string, userId?: string) => {
        const { canvas, designName, mugColor } = get();
        if (!canvas) return null;

        const supabase = createClient();

        // 1. Export to JSON
        const json = canvas.toJSON();

        // 2. Generate Preview Image
        // Use a multiplier to get a decent quality image
        const dataURL = canvas.toDataURL({
            format: 'png',
            multiplier: 0.5,
            quality: 0.8
        });

        // Convert base64 to Blob
        const res = await fetch(dataURL);
        const blob = await res.blob();
        const fileName = `${userId || 'anon'}/${Date.now()}-${uuidv4()}.png`;

        // 3. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('saved_designs')
            .upload(fileName, blob, {
                contentType: 'image/png',
                upsert: true
            });

        let previewUrl = null;
        if (uploadError) {
            console.error('Error uploading preview:', uploadError);
            // We continue saving the design even if preview fails, but log it.
        } else {
            const { data: { publicUrl } } = supabase
                .storage
                .from('saved_designs')
                .getPublicUrl(fileName);
            previewUrl = publicUrl;
        }

        // 4. Save to Database
        const savedState = {
            fabric: json,
            mugColor: mugColor
        };

        const { data, error } = await supabase
            .from('saved_designs')
            .insert({
                product_id: productId,
                name: designName,
                canvas_state: savedState,
                preview_url: previewUrl, // Save the URL
                user_id: userId || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving design:', error);
            throw error;
        }

        return data.id;
    },

    loadDesign: async (designId: string) => {
        const { canvas, setMugColor } = get();
        if (!canvas) return;

        const supabase = createClient();
        const { data, error } = await supabase
            .from('saved_designs')
            .select('*')
            .eq('id', designId)
            .single();

        if (error || !data) {
            console.error('Error loading design:', error);
            return;
        }

        // Restore state
        // Check if state has our custom wrapper or is raw fabric
        let fabricState = data.canvas_state;
        if (data.canvas_state.fabric) {
            fabricState = data.canvas_state.fabric;
            if (data.canvas_state.mugColor) {
                setMugColor(data.canvas_state.mugColor);
            }
        }

        canvas.loadFromJSON(fabricState, () => {
            canvas.requestRenderAll();
            set({ designName: data.name });
        });
    }
}));
