import React, { useRef, useState, useSyncExternalStore } from 'react';
import { Windy, WindyNode, WindySplit, WindyWindow, Direction } from './Windy';
import { Maximize2, X, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';

export function useWindy() {
  useSyncExternalStore(Windy.subscribe.bind(Windy), Windy.getSnapshot);
  return Windy;
}

export function WindyRoot() {
  const windy = useWindy();
  
  return (
    <div className="w-full h-full relative bg-[#1c1c1c] text-[#cccccc] overflow-hidden font-sans">
      {windy.root && <WindyNodeView node={windy.root} />}
      {windy.floatingWindows.map(w => (
        <FloatingWindow key={w.id} window={w} />
      ))}
    </div>
  );
}

function WindyNodeView({ node }: { node: WindyNode }) {
  if (node.type === 'split') {
    return <SplitView split={node} />;
  }
  return <WindowView window={node} />;
}

function SplitView({ split }: { split: WindySplit }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = split.direction === 'horizontal';

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    
    const onMove = (clientX: number, clientY: number) => {
      let newRatio = split.ratio;
      if (isHorizontal) {
        const x = clientX - rect.left;
        newRatio = x / rect.width;
      } else {
        const y = clientY - rect.top;
        newRatio = y / rect.height;
      }
      newRatio = Math.max(0.05, Math.min(0.95, newRatio));
      Windy.setRatio(split.id, newRatio);
    };

    const onMouseMove = (moveEvent: MouseEvent) => onMove(moveEvent.clientX, moveEvent.clientY);
    const onTouchMove = (moveEvent: TouchEvent) => onMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);

    const onEnd = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  };

  return (
    <div ref={containerRef} className={`w-full h-full flex ${isHorizontal ? 'flex-row' : 'flex-col'}`}>
      <div style={{ [isHorizontal ? 'width' : 'height']: `${split.ratio * 100}%` }} className="overflow-hidden">
        <WindyNodeView node={split.childA} />
      </div>
      <div 
        className={`relative bg-[#2d2d2d] hover:bg-[#4d4d4d] transition-colors z-10 flex items-center justify-center ${isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'}`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Invisible larger touch target */}
        <div className={`absolute ${isHorizontal ? 'w-4 h-full' : 'h-4 w-full'} bg-transparent`} />
      </div>
      <div style={{ [isHorizontal ? 'width' : 'height']: `${(1 - split.ratio) * 100}%` }} className="overflow-hidden">
        <WindyNodeView node={split.childB} />
      </div>
    </div>
  );
}

function WindowView({ window }: { window: WindyWindow }) {
  if (window.isHidden) return null;

  const handleSplit = (dir: Direction) => {
    const newWin = Windy.createWindow('New Window');
    Windy.split(window.id, newWin, dir);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#232323] border border-[#111111]">
      <div className="h-6 bg-[#2d2d2d] flex items-center justify-between px-2 select-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[#b3b3b3] uppercase tracking-wider">{window.title}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-50 hover:opacity-100 transition-opacity">
          <button onClick={() => handleSplit('horizontal')} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Split Horizontal">
            <SplitSquareHorizontal size={12} />
          </button>
          <button onClick={() => handleSplit('vertical')} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Split Vertical">
            <SplitSquareVertical size={12} />
          </button>
          <button onClick={() => Windy.float(window.id)} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Float">
            <Maximize2 size={12} />
          </button>
          <button onClick={() => Windy.close(window.id)} className="p-0.5 hover:bg-[#e04343] rounded text-[#808080] hover:text-[#ffffff]" title="Close">
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="text-[#808080] text-sm font-mono">
          <p className="mb-2">// Placeholder content</p>
          <p>Window ID: {window.id}</p>
          <p>Status: Active</p>
          <button 
            className="mt-4 px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs rounded border border-[#444444] transition-colors"
            onClick={() => Windy.trigger('action_clicked', { windowId: window.id })}
          >
            Trigger Action
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingWindow({ window }: { window: WindyWindow }) {
  const [bounds, setBounds] = useState(window.floatingBounds || { x: 100, y: 100, w: 400, h: 300 });

  const handleDragHeaderStart = (e: React.MouseEvent | React.TouchEvent) => {
    const isTouch = 'touches' in e;
    const startX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const startY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const startBounds = { ...bounds };

    const onMove = (clientX: number, clientY: number) => {
      setBounds({
        ...startBounds,
        x: startBounds.x + (clientX - startX),
        y: startBounds.y + (clientY - startY),
      });
    };

    const onMouseMove = (moveEvent: MouseEvent) => onMove(moveEvent.clientX, moveEvent.clientY);
    const onTouchMove = (moveEvent: TouchEvent) => onMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);

    const onEnd = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
      window.floatingBounds = bounds;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  };

  return (
    <div 
      className="absolute z-50 bg-[#232323] border border-[#404040] shadow-2xl flex flex-col rounded overflow-hidden"
      style={{ left: bounds.x, top: bounds.y, width: bounds.w, height: bounds.h }}
    >
      <div 
        className="h-6 bg-[#333333] flex items-center justify-between px-2 cursor-move select-none"
        onMouseDown={handleDragHeaderStart}
        onTouchStart={handleDragHeaderStart}
      >
        <span className="text-[10px] font-medium text-[#cccccc] uppercase tracking-wider">{window.title}</span>
        <div className="flex items-center gap-0.5">
          <button onClick={() => Windy.snap(window.id, Windy.root!.id, 'horizontal')} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Snap to Root">
            <SplitSquareHorizontal size={12} />
          </button>
          <button onClick={() => Windy.close(window.id)} className="p-0.5 hover:bg-[#e04343] rounded text-[#808080] hover:text-[#ffffff]" title="Close">
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="text-[#808080] text-sm font-mono">
          <p className="mb-2">// Floating Window</p>
          <p>Window ID: {window.id}</p>
        </div>
      </div>
    </div>
  );
}
