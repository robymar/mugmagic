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
    const specs = product?.specifications || {};

    // Helper to parse dimensions from specificiation strings (e.g. "96-98mm")
    const parseDim = (val: string | undefined, defaultVal: number) => {
        if (!val) return defaultVal;
        const numbers = val.match(/\d+(\.\d+)?/g)?.map(Number);
        if (!numbers || numbers.length === 0) return defaultVal;
        const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        return avg * 0.025; // Scale: 1mm = 0.025 units
    };

    // PROFILE FACTORY: Returns points for LatheGeometry based on product specs or defaults
    const getProfile = () => {
        const points = [];
        let type = category;
        if (slug.includes('conical')) type = 'conical'; // Deprecated check, stick to category or defaults
        if (slug.includes('stein')) type = 'stein';

        // 1. Determine Dimensions
        const height = parseDim(specs.height, 2.4);

        let radiusTop, radiusBottom;
        if (specs.diameter) {
            const r = parseDim(specs.diameter, 1.8) / 2;
            radiusTop = r;
            radiusBottom = r;
        } else {
            radiusTop = parseDim(specs.top_diameter, 1.8) / 2;
            radiusBottom = parseDim(specs.bottom_diameter, 1.4) / 2;
        }

        // 2. Build Profile Points based on Type
        if (category === 'latte' || type === 'conical') {
            // Conical Mug
            points.push(new THREE.Vector2(0, 0));
            points.push(new THREE.Vector2(radiusBottom, 0));
            points.push(new THREE.Vector2(radiusTop, height));
            points.push(new THREE.Vector2(radiusTop + 0.05, height + 0.05)); // Lip
            points.push(new THREE.Vector2(radiusTop - 0.05, height)); // Inner top
            points.push(new THREE.Vector2(radiusBottom - 0.05, 0.1)); // Inner base
            points.push(new THREE.Vector2(0, 0.1));
        } else if (category === 'travel' || slug.includes('travel')) {
            // Travel Mug (Tapered bottom)
            const baseW = radiusBottom || radiusTop * 0.8;
            points.push(new THREE.Vector2(0, 0));
            points.push(new THREE.Vector2(baseW, 0));
            points.push(new THREE.Vector2(radiusTop, height));
            points.push(new THREE.Vector2(radiusTop - 0.05, height));
            points.push(new THREE.Vector2(baseW - 0.05, 0.1));
            points.push(new THREE.Vector2(0, 0.1));
        } else if (category === 'metal' || slug.includes('camping')) {
            // Camping Mug (Rolled Rim)
            points.push(new THREE.Vector2(0, 0));
            points.push(new THREE.Vector2(radiusBottom, 0));
            points.push(new THREE.Vector2(radiusTop, height));
            points.push(new THREE.Vector2(radiusTop + 0.1, height + 0.05)); // Rolled rim out
            points.push(new THREE.Vector2(radiusTop - 0.05, height + 0.05)); // Rolled rim in
            points.push(new THREE.Vector2(radiusTop - 0.1, height));
            points.push(new THREE.Vector2(radiusBottom - 0.1, 0.1));
            points.push(new THREE.Vector2(0, 0.1));
        } else if (category === 'glass' || type === 'stein') {
            // Beer Stein (Thick walls, heavy base)
            points.push(new THREE.Vector2(0, 0));
            points.push(new THREE.Vector2(radiusBottom, 0));
            points.push(new THREE.Vector2(radiusBottom, 0.4)); // Heavy base outer
            points.push(new THREE.Vector2(radiusTop, height));
            points.push(new THREE.Vector2(radiusTop - 0.05, height)); // Lip
            points.push(new THREE.Vector2(radiusTop - 0.15, height - 0.1)); // Inner top
            points.push(new THREE.Vector2(radiusBottom - 0.15, 0.4)); // Inner above base
            points.push(new THREE.Vector2(radiusBottom - 0.15, 0.3)); // Inner base floor
            points.push(new THREE.Vector2(0, 0.3));
        } else {
            // Standard Ceramic
            points.push(new THREE.Vector2(0, 0));
            points.push(new THREE.Vector2(radiusBottom, 0));
            points.push(new THREE.Vector2(radiusBottom, 0.1));
            points.push(new THREE.Vector2(radiusTop, height));
            points.push(new THREE.Vector2(radiusTop + 0.05, height + 0.05)); // Lip
            points.push(new THREE.Vector2(radiusTop, height));
            points.push(new THREE.Vector2(radiusBottom - 0.1, 0.1));
            points.push(new THREE.Vector2(0, 0.1));
        }

        return { points, height, radiusTop, radiusBottom };
    };

    const { points: profilePoints, height: mugHeight, radiusTop, radiusBottom } = useMemo(() => getProfile(), [category, slug, specs]);

    // GENERATE GEOMETRY WITH ADAPTIVE UVs
    const productGeometry = useMemo(() => {
        const geometry = new THREE.LatheGeometry(profilePoints, 64);
        const posAttribute = geometry.attributes.position;
        const uvAttribute = geometry.attributes.uv;

        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const z = posAttribute.getZ(i);
            const y = posAttribute.getY(i);
            const radius = Math.sqrt(x * x + z * z);

            let u = 0, v = 0;
            let isPrintable = false;

            // Simplified Printable Area Logic based on height proportions
            // Assume printable area is middle 85% of height and outer wall
            const minY = mugHeight * 0.1;
            const maxY = mugHeight * 0.95;
            const minR = (radiusBottom + radiusTop) / 2 * 0.8; // Approx check for outer wall

            if (radius > minR && y > minY && y < maxY) {
                let angle = Math.atan2(z, x);
                if (angle < 0) angle += 2 * Math.PI;
                let u01 = 1 - (angle / (2 * Math.PI));

                // Coverage based on handle gap (approx 20% gap -> 80% coverage)
                const coverage = 0.8;
                const uStart = 0.5 - (coverage / 2);
                u = (u01 - uStart) / coverage;

                // Normalize V
                v = (y - minY) / (maxY - minY);

                isPrintable = true;
            }

            if (isPrintable) {
                // Clamping to avoid texture repeating artifacts at edges
                uvAttribute.setXY(i, Math.max(0.001, Math.min(0.999, u)), Math.max(0.001, Math.min(0.999, v)));
            } else {
                uvAttribute.setXY(i, 0, 0);
            }
        }

        geometry.computeVertexNormals();
        uvAttribute.needsUpdate = true;
        return geometry;
    }, [profilePoints, mugHeight, radiusTop, radiusBottom]);

    // HANDLE GENERATION (Ported from Blender Script & Tuned to v3 Proportions)
    const handleGeometry = useMemo(() => {
        if (category === 'travel' || category === 'bottle') return null;

        const h = mugHeight;
        const rOuter = radiusTop; // Approx outer radius at handle height

        let curve;
        let tubeRadius = 0.12;
        let scaleY = 1.0;

        // TUNING BASED ON V3 "COMPACT" VALIDATION
        // Scale conversion: v3 units * 0.25 approx = viewer units.
        // v3 Handle R 1.7 -> ~0.45 viewer units stickout.

        if (category === 'metal' || slug.includes('camping')) {
            // FLAT_STRIP (Enamel)
            const yCenter = h * 0.55;
            const stickOut = 0.45;

            curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(rOuter + 0.05, yCenter + 0.25, 0), // Top join
                new THREE.Vector3(rOuter + stickOut, yCenter + 0.35, 0), // Top out
                new THREE.Vector3(rOuter + stickOut + 0.1, yCenter - 0.1, 0), // Bottom out
                new THREE.Vector3(rOuter + 0.3, yCenter - 0.35, 0), // Bottom in
                new THREE.Vector3(rOuter + 0.05, yCenter - 0.25, 0) // Bottom join
            ]);
            tubeRadius = 0.08;
            scaleY = 0.8; // Flatten loop
            // NOTE: Geometry.scale for strip effect happens later
        }
        else if (category === 'latte' || slug.includes('conical')) {
            // EAR_SHAPE (Latte) - COMPACT V3
            // v3: Compact radius, Oval (ScaleY 1.5)
            const yTop = h * 0.75;
            const stickOut = 0.5; // Reduced from 0.9!

            curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(rOuter * 0.95, yTop, 0),
                new THREE.Vector3(rOuter + stickOut, yTop + 0.2, 0),
                new THREE.Vector3(rOuter + stickOut + 0.15, yTop - 0.4, 0),
                new THREE.Vector3(rOuter + stickOut * 0.6, yTop - 0.8, 0),
                new THREE.Vector3(radiusBottom * 1.05, yTop - 1.1, 0)
            ]);
            tubeRadius = 0.11;
            scaleY = 1.1; // Mild elongation for Ear
        }
        else if (category === 'glass' || slug.includes('stein')) {
            // TRIGGER (Stein) - Robust
            const yTop = h * 0.75;
            const stickOut = 0.6; // Sturdier

            curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(rOuter + 0.1, yTop, 0),
                new THREE.Vector3(rOuter + stickOut, yTop + 0.1, 0),
                new THREE.Vector3(rOuter + stickOut + 0.15, h * 0.5, 0),
                new THREE.Vector3(rOuter + stickOut * 0.8, h * 0.25, 0),
                new THREE.Vector3(radiusBottom + 0.15, h * 0.3, 0)
            ]);
            tubeRadius = 0.16;
        }
        else if (slug.includes('15oz')) {
            // D_ELONGATED (15oz Grande) - V3 Tuned
            // v3: ScaleY 1.6
            const yCenter = h * 0.55;
            const stickOut = 0.65; // Bigger mug, bigger handle

            curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(rOuter, yCenter + 0.5, 0),
                new THREE.Vector3(rOuter + stickOut, yCenter + 0.6, 0),
                new THREE.Vector3(rOuter + stickOut + 0.1, yCenter - 0.5, 0),
                new THREE.Vector3(rOuter + stickOut * 0.7, yCenter - 0.8, 0), // Taper in
                new THREE.Vector3(rOuter, yCenter - 0.7, 0)
            ]);
            tubeRadius = 0.13;
            scaleY = 1.2;
        }
        else {
            // C_OVAL (Standard 11oz) - V3 Tuned
            // v3: ScaleY 1.3, Radius 2.3 (~0.58)
            const yCenter = h * 0.5;
            const stickOut = 0.55;

            curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(rOuter, yCenter + 0.35, 0),
                new THREE.Vector3(rOuter + stickOut, yCenter + 0.45, 0),
                new THREE.Vector3(rOuter + stickOut + 0.15, yCenter, 0),
                new THREE.Vector3(rOuter + stickOut, yCenter - 0.45, 0),
                new THREE.Vector3(rOuter, yCenter - 0.35, 0)
            ]);
            tubeRadius = 0.12;
            scaleY = 1.15; // Match v3 1.3 feel
        }

        const geometry = new THREE.TubeGeometry(curve, 32, tubeRadius, 16, false);

        // Apply scaling
        if (category === 'metal') {
            // Strip effect
            geometry.scale(1, 0.3, 1);
        } else if (scaleY !== 1) {
            // General elongation
            geometry.scale(1, scaleY, 1);
        }

        return geometry;
    }, [category, slug, mugHeight, radiusTop, radiusBottom]);

    // MATERIAL PROPS
    const materialProps = useMemo(() => {
        const mat = specs.material || 'Ceramic';
        const isGlass = mat.toLowerCase().includes('glass') || category === 'glass';
        const isEnamel = mat.toLowerCase().includes('enamel') || category === 'metal';

        if (isGlass) {
            return {
                transmission: 0.95,
                thickness: 2.0,
                roughness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                ior: 1.5,
                color: "#ffffff"
            };
        } else if (isEnamel) {
            return {
                roughness: 0.3, // Slightly rougher/uneven
                metalness: 0.1,
                clearcoat: 0.8,
                clearcoatRoughness: 0.15,
                color: mugColor
            };
        } else {
            // Ceramic Standard
            return {
                roughness: 0.15,
                metalness: 0.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                color: mugColor
            };
        }
    }, [specs, category, mugColor]);

    return (
        <group position={[0, -mugHeight / 2, 0]}>
            {/* BASE MUG */}
            <mesh geometry={productGeometry} receiveShadow castShadow>
                <meshPhysicalMaterial
                    {...materialProps}
                    side={THREE.DoubleSide}
                    envMapIntensity={1.2}
                    transparent={materialProps.transmission ? true : false}
                />
            </mesh>

            {/* DESIGN LAYER - 2D Design Only */}
            {texture && (
                <mesh geometry={productGeometry}>
                    <meshPhysicalMaterial
                        map={texture}
                        color="#ffffff"
                        transparent={true}
                        alphaTest={0.01}
                        roughness={0.2}
                        metalness={0.0}
                        side={THREE.DoubleSide}
                        depthWrite={!materialProps.transmission} // Write depth unless glass
                        polygonOffset={true}
                        polygonOffsetFactor={-1}
                        polygonOffsetUnits={-1}
                    />
                </mesh>
            )}

            {handleGeometry && (
                <mesh geometry={handleGeometry} receiveShadow castShadow>
                    <meshPhysicalMaterial
                        {...materialProps}
                        envMapIntensity={1.2}
                        transparent={materialProps.transmission ? true : false}
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
