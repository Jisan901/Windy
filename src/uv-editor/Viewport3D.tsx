import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useWindy } from '../WindyUI';
import { useEditor } from './EditorContext';

export function Viewport3D() {
  const windy = useWindy();
  const { geometry, selectedVertices } = useEditor();

  // Create Three.js geometry from our context data
  const threeGeometry = useMemo(() => {
    if (!geometry) return null;
    
    const geo = new THREE.BufferGeometry();
    
    // Positions
    const positions = new Float32Array(geometry.positions.length * 3);
    geometry.positions.forEach((pos, i) => {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // UVs
    const uvs = new Float32Array(geometry.uvs.length * 2);
    geometry.uvs.forEach((uv, i) => {
      uvs[i * 2] = uv.x;
      uvs[i * 2 + 1] = uv.y;
    });
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    
    // Indices
    geo.setIndex(geometry.indices);
    
    geo.computeVertexNormals();
    return geo;
  }, [geometry]);

  return (
    <div className="w-full h-full bg-[#111111] relative group">
      <Canvas camera={{ position: [2, 2, 2] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {threeGeometry && (
          <group>
            <mesh geometry={threeGeometry}>
              <meshStandardMaterial color="#44aa88" side={THREE.DoubleSide} />
            </mesh>
            
            {/* Render selected vertices as small spheres */}
            {geometry && Array.from(selectedVertices).map(idx => {
              const pos = geometry.positions[idx];
              if (!pos) return null;
              return (
                <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              );
            })}
          </group>
        )}

        <OrbitControls makeDefault enabled={windy.activeTool === 'select'} />
        <gridHelper args={[10, 10, '#444444', '#222222']} />
      </Canvas>

      {/* Active Tool Indicator */}
      <div className="absolute bottom-2 right-2 text-[10px] text-[#888] font-mono bg-[#111]/50 px-2 py-0.5 rounded pointer-events-none uppercase tracking-widest">
        View Mode: {windy.activeTool === 'select' ? 'Navigation' : 'Editing UVs'}
      </div>
    </div>
  );
}
