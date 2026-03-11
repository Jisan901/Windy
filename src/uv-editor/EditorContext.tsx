import React, { createContext, useContext, useState } from 'react';

export interface UVPoint { x: number; y: number; }
export interface Position3D { x: number; y: number; z: number; }

export interface GeometryData {
  positions: Position3D[];
  uvs: UVPoint[];
  indices: number[];
}

interface EditorContextType {
  geometry: GeometryData | null;
  setGeometry: React.Dispatch<React.SetStateAction<GeometryData | null>>;
  selectedVertices: Set<number>;
  setSelectedVertices: React.Dispatch<React.SetStateAction<Set<number>>>;
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
    { x: 0.1, y: 0.1 },
    { x: 0.9, y: 0.1 },
    { x: 0.9, y: 0.9 },
    { x: 0.1, y: 0.9 },
  ],
  indices: [0, 1, 2, 0, 2, 3]
};

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [geometry, setGeometry] = useState<GeometryData | null>(INITIAL_GEOMETRY);
  const [selectedVertices, setSelectedVertices] = useState<Set<number>>(new Set());

  return (
    <EditorContext.Provider value={{
      geometry, setGeometry,
      selectedVertices, setSelectedVertices
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
