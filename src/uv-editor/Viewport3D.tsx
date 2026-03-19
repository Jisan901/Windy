import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useWindy } from '../WindyUI';
import { useEditor } from './EditorContext';

function createCheckerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    const squares = 16;
    const squareSize = canvas.width / squares;
    for (let i = 0; i < squares; i++) {
      for (let j = 0; j < squares; j++) {
        context.fillStyle = (i + j) % 2 === 0 ? '#ffffff' : '#888888';
        context.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const checkerTexture = createCheckerTexture();

export function Viewport3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { geometry, selectedVertices, activeTool, selectedObject, setSelectedObject } = useEditor();
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);

  const selectionGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
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

    const selectionGroup = new THREE.Group();
    scene.add(selectionGroup);
    selectionGroupRef.current = selectionGroup;

    // Add a default cube
    const defaultGeo = new THREE.BoxGeometry(1, 1, 1);
    const defaultMat = new THREE.MeshStandardMaterial({ 
      color: '#ffffff', 
      map: checkerTexture,
      side: THREE.DoubleSide 
    });
    const defaultMesh = new THREE.Mesh(defaultGeo, defaultMat);
    defaultMesh.position.set(-1.5, 0, 0);
    meshGroup.add(defaultMesh);

    const sphereGeo = new THREE.SphereGeometry(0.6, 32, 16);
    const sphereMesh = new THREE.Mesh(sphereGeo, defaultMat);
    sphereMesh.position.set(0, 0, 0);
    meshGroup.add(sphereMesh);

    const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const cylinderMesh = new THREE.Mesh(cylinderGeo, defaultMat);
    cylinderMesh.position.set(1.5, 0, 0);
    meshGroup.add(cylinderMesh);
    
    // Set default selected object
    setSelectedObject(sphereMesh);

    // Raycaster for selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const pointerDownPos = new THREE.Vector2();

    const onPointerDown = (event: PointerEvent) => {
      pointerDownPos.set(event.clientX, event.clientY);
    };

    const onPointerUp = (event: PointerEvent) => {
      // Only select if it was a click (not a drag)
      const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      if (dist > 5) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshGroup.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object as THREE.Mesh;
        setSelectedObject(object);
      } else {
        setSelectedObject(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      if (width === 0 || height === 0) return;
      
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
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Sync selection group transform with selected object
  useEffect(() => {
    if (selectedObject && selectionGroupRef.current) {
      selectionGroupRef.current.position.copy(selectedObject.position);
      selectionGroupRef.current.quaternion.copy(selectedObject.quaternion);
      selectionGroupRef.current.scale.copy(selectedObject.scale);
    }
  }, [selectedObject]);

  // Update selection spheres
  useEffect(() => {
    if (!selectionGroupRef.current || !geometry) return;
    const group = selectionGroupRef.current;

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

    const sphereGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });

    Array.from(selectedVertices).forEach(idx => {
      const pos = geometry.positions[idx];
      if (!pos) return;
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(pos.x, pos.y, pos.z);
      group.add(sphere);
    });
  }, [selectedVertices, geometry?.positions]);

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
