'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePaletteStorage } from '@/hooks/usePaletteStorage';
import { Palette } from '@/types';
import PaletteEditor from './PaletteEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faReact } from '@fortawesome/free-brands-svg-icons';
import { faCode, faCheckSquare, faPause, faPalette, faThLarge, faBars, faSave, faFolder, faTrash, faChartBar, faDatabase, faStar, faEye, faGear, faMagic } from '@fortawesome/free-solid-svg-icons';

interface PaletteCardProps {
  palette: Palette;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onEdit: (id: string) => void;
}

function PaletteCard({ palette, onDuplicate, onDelete, onExport, onEdit }: PaletteCardProps) {
  const colorCount = palette.colors.length;
  const preview = palette.colors.slice(0, 4); // Reduced to 4 colors for wider swatches
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
        <button
          onClick={() => onEdit(palette.id)}
          className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDuplicate(palette.id)}
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Duplicate
        </button>
        <button
          onClick={() => onExport(palette.id)}
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Export
        </button>
        <button
          onClick={() => onDelete(palette.id)}
          className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Gallery() {
  const {
    palettes,
    autoSaveEnabled,
    isLoaded,
    addPalette,
    deletePalette,
    updatePalettes,
    shouldShowWelcome,
    setShowWelcome,
    toggleAutoSave,
    manualSave,
    refreshFromStorage
  } = usePaletteStorage();

  console.log('Gallery: Component rendering, palettes count:', palettes.length);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showWelcome, setShowWelcomeModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewPalette, setShowNewPalette] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && shouldShowWelcome()) {
      setShowWelcomeModal(true);
    }
  }, [isLoaded, shouldShowWelcome]);

  const filteredPalettes = useMemo(() => {
    console.log('Gallery: Recalculating filteredPalettes, palettes count:', palettes.length);
    console.log('Gallery: Palettes data:', palettes.map(p => ({ id: p.id, name: p.name, updatedAt: p.updatedAt })));
    return palettes
      .filter(palette =>
        palette.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'colors':
            return b.colors.length - a.colors.length;
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default: // 'recent'
            return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        }
      });
  }, [palettes, searchTerm, sortBy]);

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
      name: original.name + ' (Copy)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addPalette(duplicate);
  };

  const handleDelete = (paletteId: string) => {
    const palette = palettes.find(p => p.id === paletteId);
    if (!palette) return;

    if (palettes.length <= 1) {
      alert('Cannot delete the last palette.');
      return;
    }

    if (confirm(`Delete palette "${palette.name}"? This action cannot be undone.`)) {
      deletePalette(paletteId);
    }
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

  const handleEdit = (paletteId: string) => {
    setEditingPaletteId(paletteId);
  };

  const handleBackToGallery = () => {
    console.log('Gallery: Returning to gallery view, current palettes count:', palettes.length);
    console.log('Gallery: Refreshing data from localStorage...');
    refreshFromStorage();
    setEditingPaletteId(null);
    // Add a small delay to ensure the refresh completes before rendering
    setTimeout(() => {
      console.log('Gallery: Back to gallery, palettes count after refresh:', palettes.length);
    }, 100);
  };

  const handleImportPalette = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const paletteData = JSON.parse(e.target?.result as string);

          // Import as single palette
          if (paletteData.colors && Array.isArray(paletteData.colors)) {
            const importedPalette: Palette = {
              id: 'palette_' + Date.now(),
              name: paletteData.name || 'Imported Palette',
              colors: paletteData.colors.map((item: any) => {
                if (typeof item === 'string') {
                  return { color: item, name: null };
                }
                return item;
              }),
              gridSize: paletteData.gridSize || 'medium',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            addPalette(importedPalette);
            alert('Palette imported successfully!');
          } else {
            alert('Invalid palette file format!');
          }
        } catch (error) {
          alert('Error reading palette file!');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleBackupData = () => {
    const backupData = {
      app: 'PalettePal',
      version: '1.0',
      backupDate: new Date().toISOString(),
      palettes: palettes,
      totalColors: palettes.reduce((sum, p) => sum + p.colors.length, 0),
      totalPalettes: palettes.length,
      autoSaveEnabled: autoSaveEnabled
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `PalettePal_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    alert('Backup downloaded successfully!');
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);

          if (!backupData.app || backupData.app !== 'PalettePal') {
            alert('Invalid backup file format.');
            return;
          }

          const totalPalettes = backupData.totalPalettes || backupData.palettes.length;
          const totalColors = backupData.totalColors || 0;
          const backupDate = backupData.backupDate ? new Date(backupData.backupDate).toLocaleDateString() : 'Unknown';

          if (confirm(`Import backup from ${backupDate}?\n\n${totalPalettes} palettes, ${totalColors} colors\n\nThis will replace all current data.`)) {
            updatePalettes(backupData.palettes || []);
            alert('Backup imported successfully!');
          }
        } catch (error) {
          alert('Error reading backup file.');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleClearAllData = () => {
    const totalPalettes = palettes.length;
    const totalColors = palettes.reduce((sum, p) => sum + p.colors.length, 0);

    if (confirm(`Delete all ${totalPalettes} palettes and ${totalColors} colors? This cannot be undone.`)) {
      const defaultPalette: Palette = {
        id: 'default',
        name: 'My First Palette',
        colors: [],
        gridSize: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatePalettes([defaultPalette]);
      alert('All data cleared successfully!');
    }
  };

  // If editing a palette, show the palette editor
  if (editingPaletteId) {
    return <PaletteEditor paletteId={editingPaletteId} onBack={handleBackToGallery} />;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">
            <FontAwesomeIcon icon={faPalette} className="text-primary-500" />
          </div>
          <div className="text-lg text-gray-600">Loading PalettePal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky-footer-container bg-gray-50 dark:bg-gray-900">
      <div className="sticky-footer-content">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PalettePal</h1>
                <p className="text-sm text-gray-500">Your Color Palette Tool</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewPalette(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  + New Palette
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleImportPalette}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Import
                  </button>
                  <button
                    onClick={handleBackupData}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Backup
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => setShowWelcomeModal(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    About
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex gap-4 items-center flex-1">
              <input
                type="search"
                placeholder="Search palettes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="recent">Recently Modified</option>
                <option value="name">Name (A-Z)</option>
                <option value="colors">Color Count</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <FontAwesomeIcon icon={faThLarge} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <FontAwesomeIcon icon={faBars} className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gallery */}
          {filteredPalettes.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredPalettes.map(palette => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onExport={handleExport}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                <FontAwesomeIcon icon={faPalette} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No palettes found' : 'No palettes yet'}
              </h2>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search term' : 'Create your first color palette to get started!'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowNewPalette(true)}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Create Your First Palette
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {palettes.length} palette{palettes.length !== 1 ? 's' : ''} • {' '}
              {palettes.reduce((sum, p) => sum + p.colors.length, 0)} color{palettes.reduce((sum, p) => sum + p.colors.length, 0) !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FontAwesomeIcon icon={faCode} className="text-blue-500 w-4 h-4" />
                <span>by Josh using</span>
                <FontAwesomeIcon icon={faReact} className="text-blue-500 w-4 h-4" />
              </div>
              <div className="flex gap-3">
                <a
                  href="https://github.com/SalazarJosh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="GitHub"
                >
                  <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/joshuasalazar1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="LinkedIn"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* New Palette Modal */}
      {showNewPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">New Palette</h3>
            <input
              type="text"
              placeholder="Enter palette name"
              value={newPaletteName}
              onChange={(e) => setNewPaletteName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePalette()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreatePalette}
                disabled={!newPaletteName.trim()}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewPalette(false);
                  setNewPaletteName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

            <div className="space-y-6">
              {/* Auto-save Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Auto-save</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FontAwesomeIcon 
                        icon={autoSaveEnabled ? faCheckSquare : faPause} 
                        className={`w-4 h-4 ${autoSaveEnabled ? 'text-green-500' : 'text-orange-500'}`}
                      />
                      {autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {autoSaveEnabled ? 'Changes are saved automatically' : 'Save manually to preserve changes'}
                    </p>
                  </div>
                  <button
                    onClick={toggleAutoSave}
                    className={`px-4 py-2 rounded-lg transition-colors ${autoSaveEnabled
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                  >
                    {autoSaveEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
                {!autoSaveEnabled && (
                  <button
                    onClick={manualSave}
                    className="mt-2 w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                    Save Now
                  </button>
                )}
              </div>

              {/* Data Management */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleImportBackup}
                    className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFolder} className="w-4 h-4" />
                    <div>
                      <div>Import Full Backup</div>
                      <p className="text-sm opacity-75">Replace all data with backup file</p>
                    </div>
                  </button>
                  <button
                    onClick={handleBackupData}
                    className="w-full px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                    <div>
                      <div>Download Full Backup</div>
                      <p className="text-sm opacity-75">Save all palettes and settings</p>
                    </div>
                  </button>
                  <button
                    onClick={handleClearAllData}
                    className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    <div>
                      <div>Clear All Data</div>
                      <p className="text-sm opacity-75">Delete all palettes and reset app</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Storage Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Storage Info</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartBar} className="w-4 h-4" />
                    {palettes.length} palette{palettes.length !== 1 ? 's' : ''}
                  </p>
                  <p className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faPalette} className="w-4 h-4" />
                    {palettes.reduce((sum, p) => sum + p.colors.length, 0)} color{palettes.reduce((sum, p) => sum + p.colors.length, 0) !== 1 ? 's' : ''}
                  </p>
                  <p className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faDatabase} className="w-4 h-4" />
                    Data stored in browser localStorage
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faPalette} className="text-primary-500" />
              Welcome to PalettePal!
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>PalettePal is your creative companion for building and managing color palettes with a focus on accessibility.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-primary-500" />
                  <span><strong>Gallery View:</strong> See all your palettes at a glance</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-primary-500" />
                  <span><strong>Quick Start:</strong> Click &quot;New Palette&quot; to create your first collection</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGear} className="w-4 h-4 text-primary-500" />
                  <span><strong>Easy Management:</strong> Edit, duplicate, or delete palettes with a click</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSave} className="w-4 h-4 text-primary-500" />
                  <span><strong>Auto-Save:</strong> Your work is automatically saved to your browser</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                This tool uses your browser&apos;s local storage. Download backups regularly to keep your palettes safe!
              </p>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" onChange={(e) => setShowWelcome(!e.target.checked)} />
                <span className="text-sm text-gray-600 dark:text-gray-300">Don&apos;t show this again</span>
              </label>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="ml-auto px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Start Creating!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
