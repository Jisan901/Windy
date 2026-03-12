# 🌬️ Windy UI React

[![npm version](https://img.shields.io/npm/v/windy-ui-react.svg?style=flat-square)](https://www.npmjs.com/package/windy-ui-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

A professional, Blender-inspired tiling and floating window management system for React applications. Build complex, customizable, and draggable layouts with ease.

![Windy UI Preview](https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=1000&h=400) <!-- Placeholder for actual screenshot -->

## ✨ Features

- **Tiling Window Management**: Split, resize, and organize windows just like professional 3D software (e.g., Blender, Unity).
- **Floating Windows**: Detach windows to float above the main grid, complete with dragging, maximizing, and snapping.
- **Customizable Views**: Easily define your own React components as window views with custom icons and titles.
- **Dynamic Layouts**: Programmatically control the layout via the robust `Windy` API.
- **TypeScript Ready**: Written in TypeScript with full type definitions and excellent developer ergonomics.

## 📦 Installation

Install the package and its peer dependencies via your preferred package manager:

```bash
# Using npm
npm install windy-ui-react lucide-react

# Using yarn
yarn add windy-ui-react lucide-react

# Using pnpm
pnpm add windy-ui-react lucide-react
```

> **Note:** `lucide-react` is required for the default window control icons (close, maximize, split, etc.).

## 🚀 Quick Start

Here is a minimal example to get you started with Windy UI React. 

### 1. Define Your Views
First, define the components that will render inside your windows.

```tsx
import React from 'react';
import { WindyDef } from 'windy-ui-react';
import { Square, Box } from 'lucide-react';

export const WINDY_DEFS: WindyDef[] = [
  { 
    id: 'my-view', 
    title: 'My Custom View', 
    icon: <Box size={12} />, 
    component: ({ windowId }) => (
      <div className="p-4 text-white h-full bg-neutral-800">
        Hello from window {windowId}!
      </div>
    ) 
  },
  { 
    id: 'empty', 
    title: 'Empty View', 
    icon: <Square size={12} />, 
    component: () => (
      <div className="p-4 text-gray-500 h-full bg-neutral-900">
        Empty
      </div>
    ) 
  }
];
```

### 2. Initialize and Render
Initialize the default layout on mount, and render the `WindyRoot` component.

```tsx
import React, { useEffect } from 'react';
import { WindyRoot, Windy } from 'windy-ui-react';
import { WINDY_DEFS } from './defs';

export default function App() {
  useEffect(() => {
    // Attempt to load layout from localStorage
    if (!Windy.load()) {
      // If no saved layout, initialize the default layout
      Windy.clear();
      
      // Create the root window
      const root = Windy.create('My Custom View', 'horizontal', true, 0.5, undefined, 'my-view');
      
      // Split the root window to add a second view
      Windy.split(root.id, Windy.createWindow('Empty View', 'empty'), 'horizontal', 0.5);
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1c1c1c' }}>
      <WindyRoot defs={WINDY_DEFS} />
    </div>
  );
}
```

## 📚 API Reference

### `Windy` Core API

The `Windy` singleton manages the entire state of your window layout.

| Method | Description |
| :--- | :--- |
| `Windy.create(...)` | Creates a new window and inserts it into the layout tree. |
| `Windy.createWindow(title, viewType)` | Creates a standalone window object (useful for passing to `split`). |
| `Windy.split(targetId, newWindow, direction, ratio)` | Splits an existing window horizontally or vertically. |
| `Windy.close(targetId)` | Closes a specific window and merges its space with its sibling. |
| `Windy.float(targetId)` | Detaches a window from the grid, making it a floating window. |
| `Windy.snap(targetId, targetParentId, direction)` | Snaps a floating window back into the tiling grid. |
| `Windy.maximize(targetId)` | Temporarily maximizes a window to fill the entire screen. |
| `Windy.restore()` | Restores the currently maximized window to its original size/position. |
| `Windy.setViewType(targetId, viewType, title?)` | Changes the active view component of a window. |
| `Windy.clear()` | Completely resets the window layout. |
| `Windy.save()` | Manually saves the current layout to `localStorage` (happens automatically on changes). |
| `Windy.load()` | Loads the layout from `localStorage`. Returns `true` if successful. |

### `WindyRoot` Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `defs` | `WindyDef[]` | An array of window definitions mapping string IDs to React components. |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
