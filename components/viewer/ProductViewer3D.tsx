// @ts-nocheck
"use client";

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useDesignStore } from '@/stores/designStore';
import { useCanvasTexture } from './useCanvasTexture';

const MugMesh = ({ texture, mugColor }: { texture: THREE.Texture | null; mugColor: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    // Force material update when texture changes
    useEffect(() => {
        if (materialRef.current && texture) {
            console.log('[MugMesh] Updating material with new texture');
            materialRef.current.map = texture;
            materialRef.current.needsUpdate = true;
        }
    }, [texture]);

    // Update material color when mugColor changes
    useEffect(() => {
        if (materialRef.current) {
            console.log('[MugMesh] Updating mug color to:', mugColor);
            materialRef.current.color.set(mugColor);
            materialRef.current.needsUpdate = true;
        }
    }, [mugColor]);

    useFrame((state, delta) => {
        // Optional: slight idle rotation
        // if (meshRef.current) meshRef.current.rotation.y += delta * 0.1;
    });

    return (
        <group position={[0, -0.5, 0]}>
            {/* Mug Body - open cylinder (no caps) with rotation to match 2D canvas */}
            <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1, 1, 2.5, 64, 1, true]} />
                <meshStandardMaterial
                    ref={materialRef}
                    map={texture}
                    color={mugColor}  // Color base de la taza
                    side={THREE.DoubleSide}
                    roughness={0.2}
                    metalness={0.1}
                />
            </mesh>

            {/* Interior of mug - inner cylinder to show hollow */}
            <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.92, 0.92, 2.3, 64, 1, true]} />
                <meshStandardMaterial
                    color="#ffffff"  // Interior siempre blanco
                    side={THREE.BackSide}
                    roughness={0.3}
                    metalness={0.05}
                />
            </mesh>

            {/* White caps for top and bottom */}
            <mesh position={[0, 1.25, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <circleGeometry args={[1, 64]} />
                <meshStandardMaterial color={mugColor} roughness={0.2} metalness={0.1} />
            </mesh>
            <mesh position={[0, -1.25, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <circleGeometry args={[1, 64]} />
                <meshStandardMaterial color={mugColor} roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Mug Handle */}
            <mesh position={[1.2, 0, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
                <torusGeometry args={[0.6, 0.15, 16, 32, Math.PI]} />
                <meshStandardMaterial color={mugColor} />
            </mesh>
            <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI]} castShadow receiveShadow>
                <torusGeometry args={[0.6, 0.15, 16, 32, Math.PI]} />
                <meshStandardMaterial color={mugColor} />
            </mesh>
        </group>
    );
};

export default function ProductViewer3D() {
    const { canvas, mugColor } = useDesignStore();
    const texture = useCanvasTexture(canvas);

    // Debug logging
    React.useEffect(() => {
        console.log('[ProductViewer3D] Canvas from store:', canvas);
        console.log('[ProductViewer3D] Canvas dimensions:', canvas?.width, 'x', canvas?.height);
        console.log('[ProductViewer3D] Canvas has objects:', canvas?.getObjects().length || 0);
    }, [canvas]);

    React.useEffect(() => {
        console.log('[ProductViewer3D] Texture updated:', texture);
        console.log('[ProductViewer3D] Texture is null?', texture === null);
        if (texture) {
            console.log('[ProductViewer3D] Texture image dimensions:', texture.image?.width, 'x', texture.image?.height);
        }
    }, [texture]);

    return (
        <div className="w-full h-full relative bg-gray-200 rounded-xl overflow-hidden">
            <Canvas shadows camera={{ position: [5, 3, 8], fov: 45 }}>
                <fog attach="fog" args={['#f0f0f3', 5, 20]} />
                <color attach="background" args={['#f0f0f3']} />

                {/* Manual lighting instead of Stage to prevent auto-zoom */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
                <directionalLight position={[-10, 5, -5]} intensity={0.3} />

                <MugMesh texture={texture} mugColor={mugColor} />

                <OrbitControls
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.5}
                    enablePan={false}
                    minDistance={3}
                    maxDistance={12}
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>

            {/* Loading Indicator */}
            {!texture && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm pointer-events-none">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-gray-600">Applying design to 3D...</p>
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg text-xs font-medium text-gray-600 pointer-events-none">
                Drag to Rotate 3D
            </div>
        </div>
    );
}
