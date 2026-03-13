import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useWindy } from '../WindyUI';
import { useEditor } from './EditorContext';

export function Viewport3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { geometry, selectedVertices, activeTool } = useEditor();
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(2, 2, 2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 5);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(10, 10, '#444444', '#222222');
    scene.add(gridHelper);

    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    });
    resizeObserver.observe(container);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update geometry and selection
  useEffect(() => {
    if (!meshGroupRef.current) return;
    const group = meshGroupRef.current;
    
    // Clear existing children
    while(group.children.length > 0){ 
        const child = group.children[0] as THREE.Mesh;
        group.remove(child); 
        if (child.geometry) child.geometry.dispose();
        if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
        } else if (child.material) {
            child.material.dispose();
        }
    }

    if (!geometry) return;

    // Create main mesh
    const geo = new THREE.BufferGeometry();
    
    const positions = new Float32Array(geometry.positions.length * 3);
    geometry.positions.forEach((pos, i) => {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const uvs = new Float32Array(geometry.uvs.length * 2);
    geometry.uvs.forEach((uv, i) => {
      uvs[i * 2] = uv.x;
      uvs[i * 2 + 1] = uv.y;
    });
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    
    geo.setIndex(geometry.indices);
    geo.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({ color: '#44aa88', side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, material);
    group.add(mesh);

    // Create selection spheres
    const sphereGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });

    Array.from(selectedVertices).forEach(idx => {
      const pos = geometry.positions[idx];
      if (!pos) return;
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(pos.x, pos.y, pos.z);
      group.add(sphere);
    });

  }, [geometry, selectedVertices]);

  // Update controls enabled state
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = activeTool === 'select';
    }
  }, [activeTool]);

  return (
    <div className="w-full h-full bg-[#111111] relative group">
      <div ref={containerRef} className="w-full h-full" />

      {/* Active Tool Indicator */}
      <div className="absolute bottom-2 right-2 text-[10px] text-[#888] font-mono bg-[#111]/50 px-2 py-0.5 rounded pointer-events-none uppercase tracking-widest">
        View Mode: {activeTool === 'select' ? 'Navigation' : 'Editing UVs'}
      </div>
    </div>
  );
}
