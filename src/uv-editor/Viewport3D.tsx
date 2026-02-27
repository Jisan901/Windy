import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, TransformControls } from '@react-three/drei';
import { MousePointer2, Move, RotateCw, Maximize } from 'lucide-react';

type Tool = 'select' | 'move' | 'rotate' | 'scale';

export function Viewport3D() {
  const [activeTool, setActiveTool] = useState<Tool>('select');

  return (
    <div className="w-full h-full bg-[#111111] relative group">
      {/* Tools Menu Overlay */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 bg-[#2d2d2d]/80 backdrop-blur-sm p-1 rounded-md border border-[#444] transition-opacity shadow-lg">
        <ToolButton 
          active={activeTool === 'select'} 
          onClick={() => setActiveTool('select')} 
          icon={<MousePointer2 size={14} />} 
          title="Select (W)" 
        />
        <div className="h-[1px] bg-[#444] mx-1 my-0.5" />
        <ToolButton 
          active={activeTool === 'move'} 
          onClick={() => setActiveTool('move')} 
          icon={<Move size={14} />} 
          title="Move (G)" 
        />
        <ToolButton 
          active={activeTool === 'rotate'} 
          onClick={() => setActiveTool('rotate')} 
          icon={<RotateCw size={14} />} 
          title="Rotate (R)" 
        />
        <ToolButton 
          active={activeTool === 'scale'} 
          onClick={() => setActiveTool('scale')} 
          icon={<Maximize size={14} />} 
          title="Scale (S)" 
        />
      </div>

      <Canvas camera={{ position: [2, 2, 2] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {activeTool !== 'select' ? (
          <TransformControls mode={activeTool as any}>
            <Box args={[1, 1, 1]}>
              <meshStandardMaterial color="#44aa88" />
            </Box>
          </TransformControls>
        ) : (
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color="#44aa88" />
          </Box>
        )}

        <OrbitControls makeDefault enabled={activeTool === 'select'} />
        <gridHelper args={[10, 10, '#444444', '#222222']} />
      </Canvas>

      {/* Active Tool Indicator */}
      <div className="absolute bottom-2 right-2 text-[10px] text-[#888] font-mono bg-[#111]/50 px-2 py-0.5 rounded pointer-events-none uppercase tracking-widest">
        Tool: {activeTool}
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon, title }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-blue-500 text-white' : 'text-[#b3b3b3] hover:bg-[#444] hover:text-white'}`}
    >
      {icon}
    </button>
  );
}
