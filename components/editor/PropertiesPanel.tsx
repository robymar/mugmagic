"use client";

import React from 'react';
import { useDesignStore } from '@/stores/designStore';
import * as fabric from 'fabric';

export const PropertiesPanel = () => {
    const { activeObject, canvas } = useDesignStore();

    if (!activeObject) {
        return (
            <div className="p-6 text-center text-gray-400 mt-10">
                <p>Select an element to edit</p>
            </div>
        );
    }

    const handleChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        activeObject.set('fill', e.target.value);
        canvas?.requestRenderAll();
    };

    // Helper to verify if it's text
    const isText = activeObject.type === 'i-text' || activeObject.type === 'text';

    return (
        <div className="p-6 space-y-6">
            <h3 className="font-bold text-gray-700 border-b pb-2">Edit {activeObject.type}</h3>

            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-500">Color</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        className="w-10 h-10 border-none rounded-lg cursor-pointer"
                        onChange={handleChangeColor}
                        // Default to black if no fill
                        defaultValue={activeObject.fill as string || '#000000'}
                    />
                    <span className="text-sm text-gray-600">Hex Code</span>
                </div>
            </div>

            {isText && (
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-500">Font Size</label>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        defaultValue={(activeObject as fabric.IText).fontSize || 40}
                        onChange={(e) => {
                            (activeObject as fabric.IText).set('fontSize', parseInt(e.target.value));
                            canvas?.requestRenderAll();
                        }}
                        className="w-full accent-[#667eea]"
                    />
                </div>
            )}

            <button
                className="w-full py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                onClick={() => {
                    const store = useDesignStore.getState();
                    store.deleteSelected();
                }}
            >
                Delete Layer
            </button>
        </div>
    );
};
