import React, { createContext, useContext, useState } from 'react';

export interface Position3D { x: number; y: number; z: number; }

export type ToolType = 'select' | 'pan' | 'move' | 'rotate' | 'scale';
export type SelectionMode = 'vertex' | 'face';

export interface GeometryData {
  positions: Position3D[];
  uvs: number[];
  indices: number[];
}

interface EditorContextType {
  geometry: GeometryData | null;
  setGeometry: React.Dispatch<React.SetStateAction<GeometryData | null>>;
  selectedVertices: Set<number>;
  setSelectedVertices: React.Dispatch<React.SetStateAction<Set<number>>>;
  activeTool: ToolType;
  setActiveTool: React.Dispatch<React.SetStateAction<ToolType>>;
  selectionMode: SelectionMode;
  setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>;
}

const EditorContext = createContext<EditorContextType | null>(null);

// Initial default data (a simple quad)
const INITIAL_GEOMETRY: GeometryData = {
  positions: [
    { x: -0.5, y: -0.5, z: 0 },
    { x:  0.5, y: -0.5, z: 0 },
    { x:  0.5, y:  0.5, z: 0 },
    { x: -0.5, y:  0.5, z: 0 },
  ],
  uvs: [
    0.1, 0.1,
    0.9, 0.1,
    0.9, 0.9,
    0.1, 0.9,
  ],
  indices: [0, 1, 2, 0, 2, 3]
};

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [geometry, setGeometry] = useState<GeometryData | null>(INITIAL_GEOMETRY);
  const [selectedVertices, setSelectedVertices] = useState<Set<number>>(new Set());
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('vertex');

  return (
    <EditorContext.Provider value={{
      geometry, setGeometry,
      selectedVertices, setSelectedVertices,
      activeTool, setActiveTool,
      selectionMode, setSelectionMode
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
}
