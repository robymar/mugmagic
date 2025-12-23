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
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

    // Geometry for the Mug Body (Lathe)
    const mugGeometry = useMemo(() => {
        const points = [];
        // Profile of a standard ceramic mug
        // Inside bottom
        points.push(new THREE.Vector2(0, 0.1));
        points.push(new THREE.Vector2(0.9, 0.1));
        // Inside wall
        points.push(new THREE.Vector2(0.9, 2.4));
        // Lip (rounded top)
        points.push(new THREE.Vector2(0.95, 2.5));
        points.push(new THREE.Vector2(1.0, 2.4));
        // Outside wall
        points.push(new THREE.Vector2(1.0, 0.1));
        // Outside bottom fillet
        points.push(new THREE.Vector2(0.9, 0.0));
        points.push(new THREE.Vector2(0.0, 0.0));

        // Generate geometry
        const geometry = new THREE.LatheGeometry(points, 64);

        // Calculate UVs manually to wrap the texture around the outer wall correctly
        const posAttribute = geometry.attributes.position;
        const uvAttribute = geometry.attributes.uv;

        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const z = posAttribute.getZ(i);
            const y = posAttribute.getY(i);

            // Polar coordinates for wrapping
            const angle = Math.atan2(z, x); // -PI to PI
            let u = (angle / (2 * Math.PI)) + 0.5; // 0 to 1

            // Adjust U to center the design on the "front" (usually -Z or +Z depending on rotation)
            // Flipping/offsetting as needed. 
            u = (u + 0.25) % 1;

            // Simple V based on height (roughly 0 to 2.5)
            // We want the printable area (middle ~2 units) to map to 0-1
            // Approx mapping: y=0.2 -> v=0, y=2.3 -> v=1
            const v = (y - 0.2) / 2.1;

            // Only apply this mapping to outer wall points (radius approx 1.0)
            const radius = Math.sqrt(x * x + z * z);
            if (radius > 0.95 && y > 0.05 && y < 2.45) {
                uvAttribute.setXY(i, u, v);
            } else {
                // Map other parts to a whitespace area of texture or just keep standard
                // ideally 0,0 if texture is transparent or white
                uvAttribute.setXY(i, 0, 0);
            }
        }

        geometry.computeVertexNormals();
        return geometry;
    }, []);

    // Geometry for Handle (Tube)
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

    // Update material texture
    useEffect(() => {
        if (materialRef.current && texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping; // Don't repeat vertically

            // Texture placement adjustments
            texture.repeat.set(1, 1);
            // Invert U if needed or shift
            texture.center.set(0.5, 0.5);
            texture.rotation = 0;

            materialRef.current.map = texture;
            materialRef.current.needsUpdate = true;
        }
    }, [texture]);

    // Update color
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.color.set(mugColor);
        }
    }, [mugColor]);

    return (
        <group position={[0, -1.25, 0]}> {/* Center vertically */}
            <mesh geometry={mugGeometry} receiveShadow castShadow>
                <meshPhysicalMaterial
                    ref={materialRef}
                    color={mugColor}
                    roughness={0.15}
                    metalness={0.1}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh geometry={handleGeometry} receiveShadow castShadow>
                <meshPhysicalMaterial
                    color={mugColor}
                    roughness={0.15}
                    metalness={0.1}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
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
                <spotLight
                    position={[10, 10, 5]}
                    angle={0.15}
                    penumbra={1}
                    intensity={1}
                    castShadow
                    shadow-bias={-0.0001}
                />

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
