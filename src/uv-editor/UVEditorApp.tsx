import { useEffect, useRef } from 'react';
import { MenuBar } from './MenuBar';
import { WindyRoot } from '../WindyUI';
import { Windy } from '../Windy';

export function UVEditorApp() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // Initialize the layout for the UV Editor
    Windy.clear();
    const root = Windy.create('3D Viewport', 'horizontal', true, 0.5, undefined, 'viewport3d');
    Windy.split(root.id, Windy.createWindow('UV Editor', 'uvgraph'), 'horizontal', 0.5);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-black overflow-hidden font-sans">
      <MenuBar />
      <div className="flex-1 relative">
        <WindyRoot />
      </div>
    </div>
  );
}
