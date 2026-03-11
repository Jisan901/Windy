/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UVEditorApp } from './uv-editor/UVEditorApp';
import { EditorProvider } from './uv-editor/EditorContext';

export default function App() {
  return (
    <EditorProvider>
      <UVEditorApp />
    </EditorProvider>
  );
}
