// @ts-nocheck
"use client";

import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesignStore } from '@/stores/designStore';
import { useCanvasTexture } from './useCanvasTexture';

const DynamicProductMesh = ({ texture, mugColor, product }: { texture: THREE.Texture | null; mugColor: string, product: any }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const category = product?.category || 'mug';
    const slug = product?.slug || '';

    // PROFILE FACTORY: Returns points for LatheGeometry based on product type
    const getProfile = () => {
        const points = [];
        // Determine exact type from slug
        let type = category;
        if (slug.includes('conical')) type = 'conical';
        else if (slug.includes('travel')) type = 'travel';
        else if (slug.includes('camping')) type = 'camping';
        else if (slug.includes('bottle')) type = 'bottle';

        switch (type) {
            case 'bottle':
                // Water Bottle Profile
                points.push(new THREE.Vector2(0, 0));      // Bottom center
                points.push(new THREE.Vector2(0.6, 0));    // Base radius (narrower)
                points.push(new THREE.Vector2(0.6, 2.5));  // Body top
                points.push(new THREE.Vector2(0.4, 2.8));  // Shoulder
                points.push(new THREE.Vector2(0.3, 3.2));  // Neck
                points.push(new THREE.Vector2(0.32, 3.3)); // Lip
                points.push(new THREE.Vector2(0.28, 3.2)); // Inner neck
                points.push(new THREE.Vector2(0.58, 2.5)); // Inner wall
                points.push(new THREE.Vector2(0.58, 0.1)); // Inner base
                points.push(new THREE.Vector2(0, 0.1));    // Center inner
                break;

            case 'travel':
                // Travel Mug Profile (Taller, tapered bottom)
                points.push(new THREE.Vector2(0, 0));       // Bottom center
                points.push(new THREE.Vector2(0.65, 0));    // Base radius (narrower than top)
                points.push(new THREE.Vector2(0.85, 2.8));  // Top rim (taller)
                points.push(new THREE.Vector2(0.8, 2.8));   // Inner Top
                points.push(new THREE.Vector2(0.6, 0.1));   // Inner Base
                points.push(new THREE.Vector2(0, 0.1));     // Center inner
                break;

            case 'camping':
                // Enamel Camping Mug (Short, Wide, Rolled Rim)
                points.push(new THREE.Vector2(0, 0));       // Bottom center
                points.push(new THREE.Vector2(1.1, 0));     // Wide base
                points.push(new THREE.Vector2(1.1, 1.8));   // Short body
                points.push(new THREE.Vector2(1.2, 1.85));  // Rolled Rim Out
                points.push(new THREE.Vector2(1.0, 1.85));  // Rolled Rim In
                points.push(new THREE.Vector2(1.0, 0.1));   // Inner wall
                points.push(new THREE.Vector2(0, 0.1));     // Center inner
                break;

            case 'conical':
                // Conical Mug Profile (V-shape)
                points.push(new THREE.Vector2(0, 0));      // Center bottom
                points.push(new THREE.Vector2(0.7, 0));    // Narrow base
                points.push(new THREE.Vector2(1.1, 2.4));  // Wide top
                points.push(new THREE.Vector2(1.15, 2.5)); // Lip
                points.push(new THREE.Vector2(1.05, 2.4)); // Inner top
                points.push(new THREE.Vector2(0.68, 0.1)); // Inner base
                points.push(new THREE.Vector2(0, 0.1));    // Center inner
                break;

            case 'plate':
                // Plate/Tray Profile
                points.push(new THREE.Vector2(0, 0));       // Center
                points.push(new THREE.Vector2(2.5, 0));     // Outer edge
                points.push(new THREE.Vector2(2.6, 0.2));   // Rim top
                points.push(new THREE.Vector2(2.4, 0.2));   // Rim inner
                points.push(new THREE.Vector2(0, 0.05));    // Center inner
                break;

            default:
                // Standard Cylindrical Mug
                points.push(new THREE.Vector2(0, 0));      // Center bottom
                points.push(new THREE.Vector2(0.9, 0));    // Outer base
                points.push(new THREE.Vector2(0.9, 0.1));  // Inner wall start
                points.push(new THREE.Vector2(0.9, 2.4));  // Inner wall top
                points.push(new THREE.Vector2(0.95, 2.5)); // Rounded lip
                points.push(new THREE.Vector2(1.0, 2.4));  // Outer wall top
                points.push(new THREE.Vector2(1.0, 0.1));  // Outer wall bottom
                points.push(new THREE.Vector2(0.9, 0));    // Return to base
        }
        return points;
    };

    // GENERATE GEOMETRY WITH ADAPTIVE UVs
    const productGeometry = useMemo(() => {
        const points = getProfile();
        const geometry = new THREE.LatheGeometry(points, 64);
        const posAttribute = geometry.attributes.position;
        const uvAttribute = geometry.attributes.uv;

        // Custom UV Mapping based on Shape
        let type = category;
        if (slug.includes('conical')) type = 'conical';
        else if (slug.includes('travel')) type = 'travel';
        else if (slug.includes('camping')) type = 'camping';
        else if (slug.includes('bottle')) type = 'bottle';

        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const z = posAttribute.getZ(i);
            const y = posAttribute.getY(i);
            const radius = Math.sqrt(x * x + z * z);

            let u = 0, v = 0;
            let isPrintable = false;

            if (type === 'plate') {
                // Plane mapping for plates (top view)
                if (y > 0.04) {
                    u = (x / 5) + 0.5;
                    v = (z / 5) + 0.5;
                    isPrintable = true;
                }
            } else {
                // Cylindrical/Conical mapping (wrap around)
                const isOuterWall = radius > 0.6; // Simplified check for all mug types

                // Adjust printable height range based on type
                let minY = 0.1, maxY = 2.4;
                if (type === 'bottle') { minY = 0.1; maxY = 2.5; }
                if (type === 'travel') { minY = 0.1; maxY = 2.8; }
                if (type === 'camping') { minY = 0.1; maxY = 1.8; }

                if (isOuterWall && y > minY && y < maxY) {
                    let angle = Math.atan2(z, x);
                    if (angle < 0) angle += 2 * Math.PI;
                    let u01 = 1 - (angle / (2 * Math.PI));

                    // Coverage adjustment
                    let coverage = 0.7958; // Standard Mug
                    if (type === 'bottle' || type === 'travel') coverage = 0.9;
                    if (type === 'camping') coverage = 0.85;

                    const uStart = 0.5 - (coverage / 2);
                    u = (u01 - uStart) / coverage;

                    // Normalize V based on height
                    const height = maxY - minY - (type === 'camping' ? 0.05 : 0.25);
                    v = (y - (minY + 0.05)) / height;

                    isPrintable = true;
                }
            }

            if (isPrintable) {
                uvAttribute.setXY(i, Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)));
            } else {
                uvAttribute.setXY(i, 0, 0);
            }
        }

        geometry.computeVertexNormals();
        uvAttribute.needsUpdate = true;
        return geometry;
    }, [category, slug]);

    // HANDLE GENERATION (Only for Mugs and Camping Mugs)
    const handleGeometry = useMemo(() => {
        // Explicitly exclude handles for bottles and travel mugs
        if (category !== 'mug' || slug.includes('bottle') || slug.includes('travel')) return null;

        const isConical = slug.includes('conical');
        const isCamping = slug.includes('camping');

        let curve;
        if (isCamping) {
            // Small C-handle for Camping Mug
            curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(1.1, 1.4, 0),
                new THREE.Vector3(1.5, 1.5, 0),
                new THREE.Vector3(1.6, 1.0, 0),
                new THREE.Vector3(1.5, 0.5, 0),
                new THREE.Vector3(1.1, 0.6, 0)
            ]);
            return new THREE.TubeGeometry(curve, 32, 0.08, 16, false); // Thinner handle
        } else {
            // Standard Mug Handle
            curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(isConical ? 1.05 : 0.95, 2.0, 0),
                new THREE.Vector3(1.6, 2.1, 0),
                new THREE.Vector3(1.8, 1.25, 0),
                new THREE.Vector3(1.6, 0.4, 0),
                new THREE.Vector3(isConical ? 0.8 : 0.95, 0.5, 0)
            ]);
            return new THREE.TubeGeometry(curve, 32, 0.12, 16, false);
        }
    }, [category, slug]);

    // DEBUG: Verify texture is loaded in 3D
    useEffect(() => {
        if (texture) {
            console.log('✅ Textura cargada en 3D:', {
                width: texture.image?.width,
                height: texture.image?.height,
                wrapS: texture.wrapS,
                wrapT: texture.wrapT
            });
        }
    }, [texture]);

    return (
        <group position={[0, category === 'plate' ? -0.1 : -1.25, 0]}>
            {/* BASE MUG - Color Only */}
            <mesh geometry={productGeometry} receiveShadow castShadow>
                <meshPhysicalMaterial
                    color={mugColor}
                    roughness={0.05}
                    metalness={0.05}
                    clearcoat={1.0}
                    clearcoatRoughness={0.02}
                    side={THREE.DoubleSide}
                    envMapIntensity={1.2}
                />
            </mesh>

            {/* DESIGN LAYER - 2D Design Only */}
            {texture && (
                <mesh geometry={productGeometry}>
                    <meshPhysicalMaterial
                        map={texture}
                        color="#ffffff"
                        transparent={true}
                        alphaTest={0.01}  // CHANGED: 0.05 -> 0.01 for better transparency
                        roughness={0.3}
                        metalness={0.0}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                        polygonOffset={true}
                        polygonOffsetFactor={-1}
                        polygonOffsetUnits={-1}
                    />
                </mesh>
            )}

            {handleGeometry && (
                <mesh geometry={handleGeometry} receiveShadow castShadow>
                    <meshPhysicalMaterial
                        color={mugColor}
                        roughness={0.05}
                        metalness={0.05}
                        clearcoat={1.0}
                        clearcoatRoughness={0.02}
                        envMapIntensity={1.2}
                    />
                </mesh>
            )}
        </group>
    );
};

const Scene = ({ texture, mugColor, product }: { texture: THREE.Texture | null; mugColor: string, product: any }) => {
    useFrame((state) => {
        // Subtle floating animation
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 3 + Math.sin(state.clock.elapsedTime) * 0.1, 0.1);
    });

    return (
        <>
            <Environment preset="apartment" />
            <ambientLight intensity={0.7} />

            {/* Main Key Light */}
            <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={2}
                castShadow
                shadow-bias={-0.0001}
            />

            {/* Dramatic Rim Light */}
            <pointLight position={[-10, 5, -10]} intensity={1.5} color="#ffffff" />
            <pointLight position={[0, -5, 5]} intensity={0.5} color="blue" />

            <Center top>
                <DynamicProductMesh texture={texture} mugColor={mugColor} product={product} />
            </Center>

            <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.5}
                scale={10}
                blur={2.5}
                far={4}
            />
        </>
    );
}

export default function ProductViewer3D() {
    const { canvas, mugColor, product } = useDesignStore();
    const texture = useCanvasTexture(canvas);

    return (
        <div className="w-full h-full relative bg-gradient-to-b from-gray-50 to-gray-200 rounded-xl overflow-hidden shadow-inner">
            <Canvas shadows camera={{ position: [8, 5, 10], fov: 25 }} dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <Scene texture={texture} mugColor={mugColor} product={product} />
                </Suspense>

                <OrbitControls
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.7}
                    minDistance={4}
                    maxDistance={12}
                    enablePan={false}
                    enableDamping
                    dampingFactor={0.05}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />
            </Canvas>

            {/* Premium Loading Overlay */}
            <AnimatePresence>
                {!texture && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md z-10 pointer-events-none"
                    >
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="mt-4 text-blue-600 font-bold tracking-widest text-xs uppercase animate-pulse">
                            Rendering Masterpiece
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-6 left-6 flex items-center gap-3 pointer-events-none">
                <div className="px-3 py-1.5 bg-black/5 backdrop-blur-md rounded-full border border-black/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Live Preview</span>
                </div>
            </div>
        </div>
    );
}
