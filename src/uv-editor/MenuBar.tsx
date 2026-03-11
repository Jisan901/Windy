import { MousePointer2, Hand, Dot, Square } from 'lucide-react';
import { Windy } from '../Windy';
import { useWindy } from '../WindyUI';

export function MenuBar() {
  const windy = useWindy();

  return (
    <div className="h-7 bg-[#1c1c1c] border-b border-[#111] flex items-center px-4 text-[11px] text-[#b3b3b3] select-none shrink-0 z-50 relative justify-between">
      <div className="flex gap-4 items-center">
        <span className="hover:text-white cursor-pointer transition-colors">File</span>
        <span className="hover:text-white cursor-pointer transition-colors">Edit</span>
        <span className="hover:text-white cursor-pointer transition-colors">View</span>
        <span className="hover:text-white cursor-pointer transition-colors">UV</span>
        <span className="hover:text-white cursor-pointer transition-colors">Help</span>
        
        <div className="h-4 w-[1px] bg-[#333] mx-2" />
        
        {/* Selection Mode Toggle */}
        <div className="flex items-center bg-[#2d2d2d] rounded p-0.5 gap-0.5">
          <button 
            onClick={() => windy.setSelectionMode('vertex')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${windy.selectionMode === 'vertex' ? 'bg-[#444] text-white' : 'hover:text-white'}`}
            title="Vertex Selection"
          >
            <Dot size={14} strokeWidth={3} />
            <span>Vertex</span>
          </button>
          <button 
            onClick={() => windy.setSelectionMode('face')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${windy.selectionMode === 'face' ? 'bg-[#444] text-white' : 'hover:text-white'}`}
            title="Face Selection"
          >
            <Square size={10} />
            <span>Face</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => windy.setTool('select')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${windy.activeTool === 'select' ? 'bg-blue-600 text-white' : 'hover:bg-[#333]'}`}
        >
          <MousePointer2 size={12} />
          <span>Select</span>
        </button>
        <button 
          onClick={() => windy.setTool('pan')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${windy.activeTool === 'pan' ? 'bg-blue-600 text-white' : 'hover:bg-[#333]'}`}
        >
          <Hand size={12} />
          <span>Pan</span>
        </button>
      </div>
    </div>
  );
}
