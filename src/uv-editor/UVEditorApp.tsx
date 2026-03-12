import { useEffect, useRef } from 'react';
import { MenuBar } from './MenuBar';
import { WindyRoot, HelpView, DemoView, WindyDef } from '../WindyUI';
import { Windy } from '../Windy';
import { Viewport3D } from './Viewport3D';
import { UVGraph } from './UVGraph';
import { FileText, Box, Square, BoxSelect, Image as ImageIcon } from 'lucide-react';

const WINDY_DEFS: WindyDef[] = [
  { id: 'viewport3d', title: '3D Viewport', icon: <BoxSelect size={12} />, component: Viewport3D },
  { id: 'uvgraph', title: 'UV Editor', icon: <ImageIcon size={12} />, component: UVGraph },
  { id: 'help', title: 'Documentation', icon: <FileText size={12} />, component: HelpView },
  { id: 'demo', title: 'Demo View', icon: <Box size={12} />, component: DemoView },
  { id: 'empty', title: 'Empty View', icon: <Square size={12} />, component: () => <div className="p-4 text-[#808080] text-sm font-mono"><p className="mb-2">// Empty View</p></div> }
];

export function UVEditorApp() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // Initialize the layout for the UV Editor
    if (!Windy.load()) {
      Windy.clear();
      const root = Windy.create('3D Viewport', 'horizontal', true, 0.5, undefined, 'viewport3d');
      Windy.split(root.id, Windy.createWindow('UV Editor', 'uvgraph'), 'horizontal', 0.5);
    }
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-black overflow-hidden font-sans">
      <MenuBar />
      <div className="flex-1 relative">
        <WindyRoot defs={WINDY_DEFS} />
      </div>
    </div>
  );
}
