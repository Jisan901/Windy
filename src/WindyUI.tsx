import React, { useRef, useState, useSyncExternalStore } from 'react';
import { Windy, WindyNode, WindySplit, WindyWindow, Direction, ViewType } from './Windy';
import { Maximize2, X, SplitSquareHorizontal, SplitSquareVertical, Minimize2, ChevronDown, FileText, Box, Square } from 'lucide-react';

export function useWindy() {
  useSyncExternalStore(Windy.subscribe.bind(Windy), Windy.getSnapshot);
  return Windy;
}

export function WindyRoot() {
  const windy = useWindy();
  
  let maximizedNode = null;
  if (windy.maximizedWindowId) {
    const found = windy.findNodeAndParent(windy.maximizedWindowId);
    if (found) maximizedNode = found.node;
    else {
      const floatWin = windy.floatingWindows.find(w => w.id === windy.maximizedWindowId);
      if (floatWin) maximizedNode = floatWin;
    }
  }

  return (
    <div className="w-full h-full relative bg-[#1c1c1c] text-[#cccccc] overflow-hidden font-sans">
      {maximizedNode ? (
        <div className="absolute inset-0 z-50 bg-[#1c1c1c]">
          <WindyNodeView node={maximizedNode} />
        </div>
      ) : (
        <>
          {windy.root && <WindyNodeView node={windy.root} />}
          {windy.floatingWindows.map(w => (
            <FloatingWindow key={w.id} window={w} />
          ))}
        </>
      )}
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

function WindowHeader({ window, isFloating = false }: { window: WindyWindow, isFloating?: boolean }) {
  const isMaximized = Windy.maximizedWindowId === window.id;

  const handleSplit = (dir: Direction) => {
    const newWin = Windy.createWindow('Empty View', 'empty');
    Windy.split(window.id, newWin, dir);
  };

  return (
    <div className="h-6 bg-[#2d2d2d] flex items-center justify-between px-2 select-none shrink-0">
      <div className="flex items-center gap-2 relative group">
        <button className="flex items-center gap-1.5 text-[10px] font-medium text-[#b3b3b3] uppercase tracking-wider hover:text-white transition-colors">
          {window.viewType === 'help' && <FileText size={12} />}
          {window.viewType === 'demo' && <Box size={12} />}
          {window.viewType === 'empty' && <Square size={12} />}
          {window.title}
          <ChevronDown size={10} className="opacity-50 group-hover:opacity-100" />
        </button>
        <select 
          className="absolute inset-0 opacity-0 cursor-pointer"
          value={window.viewType}
          onChange={(e) => Windy.setViewType(window.id, e.target.value as ViewType)}
        >
          <option value="empty">Empty View</option>
          <option value="demo">Demo View</option>
          <option value="help">Documentation</option>
        </select>
      </div>
      <div className="flex items-center gap-0.5 opacity-50 hover:opacity-100 transition-opacity">
        {!isFloating && !isMaximized && (
          <>
            <button onClick={() => handleSplit('horizontal')} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Split Horizontal">
              <SplitSquareHorizontal size={12} />
            </button>
            <button onClick={() => handleSplit('vertical')} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Split Vertical">
              <SplitSquareVertical size={12} />
            </button>
            <button onClick={() => Windy.float(window.id)} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Float">
              <Maximize2 size={12} />
            </button>
          </>
        )}
        {isFloating && !isMaximized && (
          <button onClick={() => Windy.snap(window.id, Windy.root!.id, 'horizontal')} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Snap to Root">
            <SplitSquareHorizontal size={12} />
          </button>
        )}
        {isMaximized ? (
          <button onClick={() => Windy.restore()} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Restore">
            <Minimize2 size={12} />
          </button>
        ) : (
          <button onClick={() => Windy.maximize(window.id)} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Maximize">
            <Maximize2 size={12} />
          </button>
        )}
        <button onClick={() => Windy.close(window.id)} className="p-0.5 hover:bg-[#e04343] rounded text-[#808080] hover:text-[#ffffff]" title="Close">
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function WindowView({ window }: { window: WindyWindow }) {
  if (window.isHidden) return null;

  return (
    <div className="w-full h-full flex flex-col bg-[#232323] border border-[#111111] overflow-hidden">
      <WindowHeader window={window} />
      <div className="flex-1 overflow-auto relative">
        {window.viewType === 'help' && <HelpView />}
        {window.viewType === 'demo' && <DemoView windowId={window.id} />}
        {window.viewType === 'empty' && (
          <div className="p-4 text-[#808080] text-sm font-mono">
            <p className="mb-2">// Empty View</p>
            <p>Window ID: {window.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FloatingWindow({ window }: { window: WindyWindow }) {
  const [bounds, setBounds] = useState(window.floatingBounds || { x: 100, y: 100, w: 400, h: 300 });
  const isMaximized = Windy.maximizedWindowId === window.id;

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

  if (isMaximized) return null; // Handled by WindyRoot

  return (
    <div 
      className="absolute z-50 bg-[#232323] border border-[#404040] shadow-2xl flex flex-col rounded overflow-hidden"
      style={{ left: bounds.x, top: bounds.y, width: bounds.w, height: bounds.h }}
    >
      <div 
        className="h-6 bg-[#333333] flex items-center justify-between px-2 cursor-move select-none shrink-0"
        onMouseDown={handleDragHeaderStart}
        onTouchStart={handleDragHeaderStart}
      >
        <div className="flex items-center gap-2 relative group">
          <button className="flex items-center gap-1.5 text-[10px] font-medium text-[#cccccc] uppercase tracking-wider hover:text-white transition-colors">
            {window.viewType === 'help' && <FileText size={12} />}
            {window.viewType === 'demo' && <Box size={12} />}
            {window.viewType === 'empty' && <Square size={12} />}
            {window.title}
            <ChevronDown size={10} className="opacity-50 group-hover:opacity-100" />
          </button>
          <select 
            className="absolute inset-0 opacity-0 cursor-pointer"
            value={window.viewType}
            onChange={(e) => Windy.setViewType(window.id, e.target.value as ViewType)}
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
          >
            <option value="empty">Empty View</option>
            <option value="demo">Demo View</option>
            <option value="help">Documentation</option>
          </select>
        </div>
        <div className="flex items-center gap-0.5" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <button onClick={() => Windy.snap(window.id, Windy.root!.id, 'horizontal')} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Snap to Root">
            <SplitSquareHorizontal size={12} />
          </button>
          <button onClick={() => Windy.maximize(window.id)} className="p-0.5 hover:bg-[#404040] rounded text-[#808080] hover:text-[#ffffff]" title="Maximize">
            <Maximize2 size={12} />
          </button>
          <button onClick={() => Windy.close(window.id)} className="p-0.5 hover:bg-[#e04343] rounded text-[#808080] hover:text-[#ffffff]" title="Close">
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto relative">
        {window.viewType === 'help' && <HelpView />}
        {window.viewType === 'demo' && <DemoView windowId={window.id} />}
        {window.viewType === 'empty' && (
          <div className="p-4 text-[#808080] text-sm font-mono">
            <p className="mb-2">// Floating Window</p>
            <p>Window ID: {window.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HelpView() {
  return (
    <div className="text-[#cccccc] text-sm p-6 space-y-6 font-sans h-full overflow-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Windy UI Manager</h1>
        <p className="text-[#a0a0a0]">Windy is a flexible, Blender-inspired window management system for React.</p>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 border-b border-[#444] pb-1">Features</h2>
        <ul className="list-disc pl-5 space-y-2 text-[#b0b0b0]">
          <li><strong className="text-white">View Types:</strong> Click the dropdown in the top-left of any window header to change its content (e.g., Help, Demo, Empty).</li>
          <li><strong className="text-white">Splitting:</strong> Use the split icons in the top-right to divide a window horizontally or vertically.</li>
          <li><strong className="text-white">Resizing:</strong> Drag the dark borders between windows to adjust their size.</li>
          <li><strong className="text-white">Floating:</strong> Click the float icon to detach a window from the grid so it floats above others.</li>
          <li><strong className="text-white">Snapping:</strong> Click the snap icon on a floating window to snap it back into the main grid.</li>
          <li><strong className="text-white">Maximizing:</strong> Click the maximize icon to temporarily expand a window to fill the entire screen.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3 border-b border-[#444] pb-1">API Reference</h2>
        <div className="bg-[#1a1a1a] p-4 rounded border border-[#333] font-mono text-xs space-y-3">
          <p><span className="text-blue-400">Windy.create</span>(title, side, resizeAble, size, parentId, viewType)</p>
          <p><span className="text-blue-400">Windy.split</span>(targetId, newWindow, direction, ratio)</p>
          <p><span className="text-blue-400">Windy.close</span>(targetId)</p>
          <p><span className="text-blue-400">Windy.float</span>(targetId)</p>
          <p><span className="text-blue-400">Windy.snap</span>(targetId, targetParentId, direction)</p>
          <p><span className="text-blue-400">Windy.maximize</span>(targetId)</p>
          <p><span className="text-blue-400">Windy.restore</span>()</p>
          <p><span className="text-blue-400">Windy.setViewType</span>(targetId, viewType)</p>
        </div>
      </div>
    </div>
  );
}

function DemoView({ windowId }: { windowId: string }) {
  return (
    <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4">
      <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center animate-pulse">
        <Box className="text-blue-400" size={32} />
      </div>
      <div>
        <h3 className="text-white font-medium">Demo Component</h3>
        <p className="text-xs text-[#888] mt-1">Window ID: {windowId}</p>
      </div>
      <button 
        className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded text-xs transition-colors border border-[#444]"
        onClick={() => Windy.trigger('demo_action', { id: windowId })}
      >
        Test Event Bus
      </button>
    </div>
  );
}
