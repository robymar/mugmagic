// @ts-nocheck
"use client";

import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useDesignStore } from '@/stores/designStore';
import { useCanvasTexture } from './useCanvasTexture';

const RealisticMugMesh = ({ texture, mugColor }: { texture: THREE.Texture | null; mugColor: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Geometry for the Mug Body - CORRECTED UV MAPPING
    const mugGeometry = useMemo(() => {
        const points = [];
        // Corrected profile with clear coordinates
        points.push(new THREE.Vector2(0, 0));      // Center bottom
        points.push(new THREE.Vector2(0.9, 0));    // Outer base
        points.push(new THREE.Vector2(0.9, 0.1));  // Inner wall start
        points.push(new THREE.Vector2(0.9, 2.4));  // Inner wall top
        points.push(new THREE.Vector2(0.95, 2.5)); // Rounded lip
        points.push(new THREE.Vector2(1.0, 2.4));  // Outer wall top
        points.push(new THREE.Vector2(1.0, 0.1));  // Outer wall bottom
        points.push(new THREE.Vector2(0.9, 0));    // Return to base

        const geometry = new THREE.LatheGeometry(points, 64);
        const posAttribute = geometry.attributes.position;
        const uvAttribute = geometry.attributes.uv;

        // CORRECT values for outer wall
        const outerWallBottomY = 0.1;  // Where outer wall starts
        const outerWallTopY = 2.4;     // Where outer wall ends

        // Epsilon to avoid floating point misses
        const EPSILON = 0.001;

        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const z = posAttribute.getZ(i);
            const y = posAttribute.getY(i);

            // Radius in XZ plane
            const radius = Math.sqrt(x * x + z * z);

            // PHYSICAL DIMENSIONS (Unit Conversion)
            // Model Height: 2.5 units = 10 cm Physical Height
            // Scale: 1 cm = 0.25 units
            // Printable Height: 9 cm (Centered)
            // Margins: 0.5 cm Top / 0.5 cm Bottom

            const marginUnits = 0.5 * 0.25; // 0.125 units
            const printableBottomUnits = marginUnits; // 0.125
            const printableTopUnits = 2.5 - marginUnits; // 2.375
            const printableHeightUnits = printableTopUnits - printableBottomUnits; // 2.25

            // Outer wall vertices check 
            if (radius > 0.95 && y > (outerWallBottomY - EPSILON) && y < (outerWallTopY + EPSILON)) {

                // === U COORDINATE - HORIZONTAL ===
                let angle = Math.atan2(z, x);
                if (angle < 0) angle += 2 * Math.PI;
                let u01 = 1 - (angle / (2 * Math.PI)); // 0..1 around circumference

                // FIX: Calculated Coverage for 20cm width
                // Mug Radius ~1.0 unit = 4cm -> Diameter 8cm -> Circumference ~25.1cm
                // 20cm / 25.1cm = ~0.796
                // Reducing slightly to 0.78 ensures circles are circular (not wide).
                const printableCoverage = 0.78;
                const uStart = 0.5 - (printableCoverage / 2);

                let u = (u01 - uStart) / printableCoverage;

                // === V COORDINATE - VERTICAL ===
                // Map mesh Y to 0..1 within the PHYSICAL 9cm ZONE
                // y = 0.125 -> v = 0
                // y = 2.375 -> v = 1
                let v = (y - printableBottomUnits) / printableHeightUnits;

                // V is NOT inverted (0 is bottom)

                // CLAMPING
                const safeU = Math.max(0, Math.min(1, u));
                const safeV = Math.max(0, Math.min(1, v));

                uvAttribute.setXY(i, safeU, safeV);
            } else {
                // Non-printable vertices
                uvAttribute.setXY(i, 0, 0);
            }
        }

        geometry.computeVertexNormals();
        uvAttribute.needsUpdate = true;

        // DEBUG: Log UV stats
        console.log('UV Stats:');
        const uvArray = geometry.attributes.uv.array;
        let uvCount = 0;
        for (let i = 0; i < uvArray.length; i += 2) {
            if (uvArray[i] > 0 || uvArray[i + 1] > 0) {
                uvCount++;
            }
        }
        console.log(`Vertices with UV > 0: ${uvCount}/${uvArray.length / 2}`);

        return geometry;
    }, []);

    const handleGeometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.95, 2.0, 0),
            new THREE.Vector3(1.6, 2.1, 0),
            new THREE.Vector3(1.8, 1.25, 0),
            new THREE.Vector3(1.6, 0.4, 0),
            new THREE.Vector3(0.95, 0.5, 0)
        ]);
        return new THREE.TubeGeometry(curve, 32, 0.15, 16, false);
    }, []);

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
        <group position={[0, -1.25, 0]}>
            {/* BASE MUG - Color Only */}
            <mesh geometry={mugGeometry} receiveShadow castShadow>
                <meshPhysicalMaterial
                    color={mugColor}
                    roughness={0.15}
                    metalness={0.1}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
                    side={THREE.DoubleSide}
                    envMapIntensity={0.5}
                />
            </mesh>

            {/* DESIGN LAYER - 2D Design Only */}
            {texture && (
                <mesh geometry={mugGeometry}>
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

            <mesh geometry={handleGeometry} receiveShadow castShadow>
                <meshPhysicalMaterial
                    color={mugColor}
                    roughness={0.15}
                    metalness={0.1}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
                    envMapIntensity={0.5}
                />
            </mesh>
        </group>
    );
};

export default function ProductViewer3D() {
    const { canvas, mugColor } = useDesignStore();
    const texture = useCanvasTexture(canvas);

    return (
        <div className="w-full h-full relative bg-gray-100 rounded-xl overflow-hidden shadow-inner">
            <Canvas shadows camera={{ position: [4, 2, 5], fov: 35 }}>
                {/* Environment & Lighting */}
                <Environment preset="studio" />
                <ambientLight intensity={0.5} />

                {/* Main Key Light - Soft Front Right */}
                <spotLight
                    position={[5, 5, 5]}
                    angle={0.4}
                    penumbra={1}
                    intensity={0.8}
                    castShadow
                    shadow-bias={-0.0001}
                />

                {/* Fill Light - Front Left */}
                <pointLight position={[-5, 2, 5]} intensity={0.4} />

                {/* Rim Light - Back High */}
                <pointLight position={[0, 5, -5]} intensity={0.5} />

                <Center>
                    <RealisticMugMesh texture={texture} mugColor={mugColor} />
                </Center>

                <ContactShadows
                    position={[0, -1.26, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2}
                    far={4}
                />

                <OrbitControls
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.5}
                    minDistance={3}
                    maxDistance={10}
                    enablePan={false}
                    enableDamping
                />
            </Canvas>

            {/* Loading Overlay */}
            {!texture && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 pointer-events-none">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 pointer-events-none shadow-sm border border-white/50">
                Interactive 3D Preview
            </div>
        </div>
    );
}
