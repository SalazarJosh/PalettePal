'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePaletteStorage } from '@/hooks/usePaletteStorage';
import { Palette } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckSquare, 
  faPause, 
  faPalette, 
  faThLarge, 
  faBars, 
  faSave, 
  faFolder, 
  faTrash, 
  faChartBar, 
  faDatabase, 
  faStar, 
  faEye, 
  faGear, 
  faMagic,
  faPlus,
  faUpload
} from '@fortawesome/free-solid-svg-icons';

interface PaletteCardProps {
  palette: Palette;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onEdit: (id: string) => void;
}

function PaletteCard({ palette, onDuplicate, onDelete, onExport, onEdit }: PaletteCardProps) {
  const colorCount = palette.colors.length;
  const preview = palette.colors.slice(0, 4);
  const lastModified = new Date(palette.updatedAt || palette.createdAt).toLocaleDateString();

  // Function to determine text color based on background color and calculate contrast ratio
  const getTextColorAndContrast = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const backgroundLuminance = getLuminance(r, g, b);
    const whiteLuminance = 1;
    const blackLuminance = 0;

    // Calculate contrast ratios
    const whiteContrast = (whiteLuminance + 0.05) / (backgroundLuminance + 0.05);
    const blackContrast = (backgroundLuminance + 0.05) / (blackLuminance + 0.05);

    // Choose the color with better contrast
    const useWhite = whiteContrast > blackContrast;
    const contrastRatio = useWhite ? whiteContrast : blackContrast;

    return {
      textColor: useWhite ? '#ffffff' : '#000000',
      contrastRatio: Math.round(contrastRatio * 100) / 100
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="mb-4">
        {preview.length > 0 ? (
          <div className="flex">
            {preview.map((color, index) => {
              const { textColor, contrastRatio } = getTextColorAndContrast(color.color);
              return (
                <div
                  key={index}
                  className="flex-1 h-8"
                  style={{
                    backgroundColor: color.color,
                    color: textColor
                  }}
                >
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <span className="text-gray-500 text-sm italic">No colors yet</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {palette.name}
        </h3>
        <p className="text-sm text-gray-500">
          {colorCount} color{colorCount !== 1 ? 's' : ''} • {lastModified}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => onEdit(palette.id)}
          variant="primary"
          size="sm"
        >
          Edit
        </Button>
        <Button
          onClick={() => onDuplicate(palette.id)}
          variant="secondary"
          size="sm"
        >
          Duplicate
        </Button>
        <Button
          onClick={() => onExport(palette.id)}
          variant="secondary"
          size="sm"
        >
          Export
        </Button>
        <Button
          onClick={() => onDelete(palette.id)}
          variant="danger"
          size="sm"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

interface GalleryPageProps {
  onEditPalette: (paletteId: string) => void;
}

export default function GalleryPage({ onEditPalette }: GalleryPageProps) {
  const { palettes, addPalette, deletePalette, isLoaded } = usePaletteStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showWelcome, setShowWelcomeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewPalette, setShowNewPalette] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');

  useEffect(() => {
    if (isLoaded && palettes.length === 0) {
      setShowWelcomeModal(true);
    }
  }, [isLoaded, palettes.length]);

  const handleCreatePalette = () => {
    if (!newPaletteName.trim()) return;

    const newPalette: Palette = {
      id: 'palette_' + Date.now(),
      name: newPaletteName.trim(),
      colors: [],
      gridSize: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addPalette(newPalette);
    setNewPaletteName('');
    setShowNewPalette(false);
  };

  const handleDuplicate = (paletteId: string) => {
    const original = palettes.find(p => p.id === paletteId);
    if (!original) return;

    const duplicate: Palette = {
      ...original,
      id: 'palette_' + Date.now(),
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addPalette(duplicate);
  };

  const handleDelete = (paletteId: string) => {
    const palette = palettes.find(p => p.id === paletteId);
    if (!palette) return;

    if (confirm(`Delete "${palette.name}"? This action cannot be undone.`)) {
      deletePalette(paletteId);
    }
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(palettes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `palette_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleExport = (paletteId: string) => {
    const palette = palettes.find(p => p.id === paletteId);
    if (!palette) return;

    const dataStr = JSON.stringify(palette, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${palette.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const importedData = JSON.parse(content);

            if (Array.isArray(importedData)) {
              // Import multiple palettes
              importedData.forEach(palette => {
                palette.id = 'palette_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                palette.createdAt = new Date().toISOString();
                palette.updatedAt = new Date().toISOString();
                addPalette(palette);
              });
            } else if (importedData.id && importedData.name && importedData.colors) {
              importedData.id = 'palette_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
              importedData.createdAt = new Date().toISOString();
              importedData.updatedAt = new Date().toISOString();
              addPalette(importedData);
            }
          } catch (error) {
            alert('Error importing file: Invalid format');
          }
        };
        reader.readAsText(file);
      });
    };

    input.click();
  };

  const filteredAndSortedPalettes = useMemo(() => {
    let filtered = palettes.filter(palette =>
      palette.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'colors':
        filtered.sort((a, b) => b.colors.length - a.colors.length);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt).getTime() - 
          new Date(a.updatedAt || a.createdAt).getTime()
        );
        break;
    }

    return filtered;
  }, [palettes, searchTerm, sortBy]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-purple-500">
            <FontAwesomeIcon icon={faPalette} />
          </div>
          <div className="text-lg text-gray-600">Loading palettes...</div>
        </div>
      </div>
    );
  }

  const headerContent = (
    <>
      <Button
        onClick={handleExportAll}
        variant="secondary"
        size="sm"
        icon={faSave}
      >
        Backup
      </Button>
      <Button
        onClick={handleImport}
        variant="secondary"
        size="sm"
        icon={faFolder}
      >
        Restore
      </Button>
      <Button
        onClick={() => setShowSettings(true)}
        variant="secondary"
        size="sm"
        icon={faGear}
      >
        Settings
      </Button>
      <Button
        onClick={() => setShowWelcomeModal(true)}
        variant="secondary"
        size="sm"
        icon={faEye}
      >
        About
      </Button>
    </>
  );

  return (
    <div className="sticky-footer-container bg-gray-50 dark:bg-gray-900">
      <div className="sticky-footer-content">
        <Header rightContent={headerContent} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowNewPalette(true)}
                  variant="primary"
                  icon={faPlus}
                >
                  New Palette
                </Button>
                <Button
                  onClick={handleImport}
                  variant="secondary"
                  icon={faUpload}
                >
                  Import
                </Button>
              </div>
              <div className="flex items-center gap-4">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search palettes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                  <option value="colors">Color Count</option>
                </select>

                {/* View Toggle */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    size="sm"
                    icon={faThLarge}
                    className="rounded-none border-none"
                  >
                    Grid
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    size="sm"
                    icon={faBars}
                    className="rounded-none border-none border-l border-gray-300 dark:border-gray-600"
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Palettes Grid/List */}
          <div className="px-6 pb-6">
            {filteredAndSortedPalettes.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredAndSortedPalettes.map(palette => (
                  <PaletteCard
                    key={palette.id}
                    palette={palette}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onExport={handleExport}
                    onEdit={onEditPalette}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 text-purple-500">
                  <FontAwesomeIcon icon={faPalette} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No palettes found' : 'No palettes yet'}
                </h2>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? `Try adjusting your search term "${searchTerm}"`
                    : 'Create your first color palette to get started!'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowNewPalette(true)}
                    variant="primary"
                    icon={faPlus}
                  >
                    Create Your First Palette
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* New Palette Modal */}
      {showNewPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New Palette
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Palette Name
                </label>
                <input
                  type="text"
                  value={newPaletteName}
                  onChange={(e) => setNewPaletteName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreatePalette();
                    if (e.key === 'Escape') setShowNewPalette(false);
                  }}
                  placeholder="Enter palette name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreatePalette}
                variant="primary"
                disabled={!newPaletteName.trim()}
                fullWidth
              >
                Create Palette
              </Button>
              <Button
                onClick={() => setShowNewPalette(false)}
                variant="secondary"
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
