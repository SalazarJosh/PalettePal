// Example of how to use the new components in your app
// This would replace your existing Gallery.tsx component

'use client';

import { useState } from 'react';
import GalleryPage from '@/pages/GalleryPage';
import PaletteEditorPage from '@/pages/PaletteEditorPage';

export default function App() {
  const [currentView, setCurrentView] = useState<'gallery' | 'editor'>('gallery');
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);

  const handleEditPalette = (paletteId: string) => {
    setEditingPaletteId(paletteId);
    setCurrentView('editor');
  };

  const handleBackToGallery = () => {
    setCurrentView('gallery');
    setEditingPaletteId(null);
  };

  if (currentView === 'editor' && editingPaletteId) {
    return (
      <PaletteEditorPage 
        paletteId={editingPaletteId} 
        onBack={handleBackToGallery} 
      />
    );
  }

  return <GalleryPage onEditPalette={handleEditPalette} />;
}
