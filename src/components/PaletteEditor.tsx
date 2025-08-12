'use client';

import { useState, useEffect } from 'react';
import { usePaletteStorage } from '@/hooks/usePaletteStorage';
import { Color, Palette } from '@/types';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faClipboard, faCheck, faEdit, faPlus, faExclamationTriangle, faTimes, faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';

// Utility function to calculate contrast ratio between two colors
function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const parseColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const fg = parseColor(foreground);
  const bg = parseColor(background);

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

  const lightest = Math.max(fgLuminance, bgLuminance);
  const darkest = Math.min(fgLuminance, bgLuminance);

  return Math.round(((lightest + 0.05) / (darkest + 0.05)) * 100) / 100;
}

// Function to determine text color based on background color and calculate contrast ratio
function getTextColorAndContrast(hexColor: string) {
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
}

interface PaletteEditorProps {
  paletteId: string;
  onBack?: () => void;
}

interface ColorGridProps {
  colors: Color[];
  onColorClick: (index: number) => void;
  onAddColor: () => void;
  gridSize: 'small' | 'medium' | 'large';
  onCopyNotification: (message: string) => void;
}

function ColorGrid({ colors, onColorClick, onAddColor, gridSize, onCopyNotification }: ColorGridProps) {
  const maxColors = gridSize === 'small' ? 12 : gridSize === 'medium' ? 24 : 48;
  const gridCols = gridSize === 'small' ? 'grid-cols-2' : gridSize === 'medium' ? 'grid-cols-3' : 'grid-cols-4';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onCopyNotification(`Copied ${text}`);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      onCopyNotification(`Copied ${text}`);
    });
  };

  return (
    <div className={`grid ${gridCols} gap-4 p-6`}>
      {colors.map((color, index) => {
        const { textColor, contrastRatio } = getTextColorAndContrast(color.color);
        return (
          <div
            key={index}
            className="relative rounded-lg cursor-pointer hover:scale-105 transition-transform border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500 group overflow-hidden"
            style={{
              backgroundColor: color.color,
              aspectRatio: '2/1',
              minHeight: '80px'
            }}
          >
            <button
              onClick={() => onColorClick(index)}
              className="absolute inset-0 w-full h-full flex justify-between items-center p-3 text-center"
              style={{ color: textColor }}
            >
              <div className="flex-1">
                {color.name && (
                  <div className="font-semibold text-sm mb-1 text-shadow-sm truncate w-full">
                    {color.name}
                  </div>
                )}
                <div className="font-mono text-xs opacity-90">
                  {color.color.toUpperCase()}
                </div>
              </div>
              <div className="text-right text-xs opacity-80 ml-2">
                <div className="font-mono font-bold">
                  {contrastRatio}:1
                </div>
                <div className="text-xs opacity-70">
                  {contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : contrastRatio >= 3 ? 'AA Large' : 'Fail'}
                </div>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(color.color);
              }}
              className="absolute top-2 right-2 w-30 h-6 bg-black bg-opacity-50 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Copy color code"
            >
              <FontAwesomeIcon icon={faClipboard} className="mr-1" /> Copy
            </button>
          </div>
        );
      })}
      {colors.length < maxColors && (
        <button
          onClick={onAddColor}
          className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 flex items-center justify-center text-gray-400 hover:text-primary-500 transition-colors"
          style={{ aspectRatio: '2/1', minHeight: '80px' }}
        >
          <FontAwesomeIcon icon={faPlus} className="text-2xl" />
        </button>
      )}
    </div>
  );
}

export default function PaletteEditor({ paletteId, onBack }: PaletteEditorProps) {
  const { getPalette, updatePalette, isLoaded } = usePaletteStorage();
  const [palette, setPalette] = useState<Palette | null>(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showContrastChecker, setShowContrastChecker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [colorName, setColorName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempPaletteName, setTempPaletteName] = useState('');

  // Contrast checker state
  const [contrastForeground, setContrastForeground] = useState('#000000');
  const [contrastBackground, setContrastBackground] = useState('#ffffff');
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      const foundPalette = getPalette(paletteId);
      setPalette(foundPalette || null);
      if (foundPalette && !isEditingName) {
        setTempPaletteName(foundPalette.name);
      }
    }
  }, [paletteId, getPalette, isLoaded, isEditingName]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-purple-500">
            <FontAwesomeIcon icon={faPalette} />
          </div>
          <div className="text-lg text-gray-600">Loading palette...</div>
        </div>
      </div>
    );
  }

  if (!palette) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-red-500">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className="text-lg text-gray-600 mb-4">Palette not found</div>
          <Link
            href="/"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const handleAddColor = () => {
    setEditingIndex(null);
    setSelectedColor('#000000');
    setColorName('');
    setShowColorModal(true);
  };

  const handleColorClick = (index: number) => {
    const color = palette.colors[index];
    setEditingIndex(index);
    setSelectedColor(color.color);
    setColorName(color.name || '');
    setShowColorModal(true);
  };

  const handleSaveColor = () => {
    if (!palette) return;

    const newColor: Color = {
      color: selectedColor,
      name: colorName.trim() || null
    };

    let newColors: Color[];
    if (editingIndex !== null) {
      // Edit existing color
      newColors = [...palette.colors];
      newColors[editingIndex] = newColor;
    } else {
      // Add new color
      newColors = [...palette.colors, newColor];
    }

    updatePalette(palette.id, { colors: newColors });
    console.log('PaletteEditor: Updated palette colors, new count:', newColors.length);
    setPalette({ ...palette, colors: newColors });
    setShowColorModal(false);
  };

  const handleDeleteColor = () => {
    if (!palette || editingIndex === null) return;

    const newColors = palette.colors.filter((_, index) => index !== editingIndex);
    updatePalette(palette.id, { colors: newColors });
    setPalette({ ...palette, colors: newColors });
    setShowColorModal(false);
  };

  const handleClearPalette = () => {
    if (!palette || palette.colors.length === 0) return;

    if (confirm('Clear all colors from the palette?')) {
      updatePalette(palette.id, { colors: [] });
      setPalette({ ...palette, colors: [] });
    }
  };

  const handleExportPalette = () => {
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

  const handleSavePaletteName = () => {
    if (!palette || !tempPaletteName.trim()) return;

    console.log('PaletteEditor: Saving palette name:', tempPaletteName.trim());
    updatePalette(palette.id, { name: tempPaletteName.trim() });
    setPalette({ ...palette, name: tempPaletteName.trim() });
    setIsEditingName(false);
  };

  const handleCancelNameEdit = () => {
    setTempPaletteName(palette?.name || '');
    setIsEditingName(false);
  };

  const handleCopyNotification = (message: string) => {
    setCopyNotification(message);
    setTimeout(() => setCopyNotification(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyNotification(`Copied ${text}`);
      setTimeout(() => setCopyNotification(null), 3000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyNotification(`Copied ${text}`);
      setTimeout(() => setCopyNotification(null), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {onBack ? (
                <button
                  onClick={onBack}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  ← Gallery
                </button>
              ) : (
                <Link
                  href="/"
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  ← Gallery
                </Link>
              )}
              <div>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempPaletteName}
                      onChange={(e) => setTempPaletteName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePaletteName();
                        if (e.key === 'Escape') handleCancelNameEdit();
                      }}
                      className="text-xl font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                      autoFocus
                    />
                    <button
                      onClick={handleSavePaletteName}
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      onClick={handleCancelNameEdit}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{palette.name}</h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="Edit palette name"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-500">{palette.colors.length} colors</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={palette.gridSize}
                onChange={(e) => {
                  const newGridSize = e.target.value as 'small' | 'medium' | 'large';
                  updatePalette(palette.id, { gridSize: newGridSize });
                  setPalette({ ...palette, gridSize: newGridSize });
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="small">Small Grid (4×3)</option>
                <option value="medium">Medium Grid (6×4)</option>
                <option value="large">Large Grid (8×6)</option>
              </select>
              <button
                onClick={() => setShowContrastChecker(true)}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Contrast
              </button>
              <button
                onClick={handleAddColor}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Add Color
              </button>
              <button
                onClick={handleClearPalette}
                disabled={palette.colors.length === 0}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleExportPalette}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {palette.colors.length > 0 ? (
          <ColorGrid
            colors={palette.colors}
            onColorClick={handleColorClick}
            onAddColor={handleAddColor}
            gridSize={palette.gridSize}
            onCopyNotification={handleCopyNotification}
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 text-purple-500">
              <FontAwesomeIcon icon={faPalette} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Empty palette
            </h2>
            <p className="text-gray-500 mb-6">
              Add your first color to get started!
            </p>
            <button
              onClick={handleAddColor}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add First Color
            </button>
          </div>
        )}
      </main>

      {/* Color Modal */}
      {showColorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingIndex !== null ? 'Edit Color' : 'Add Color'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-16 h-12 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#000000"
                  />
                </div>
                <button
                  onClick={() => copyToClipboard(selectedColor)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  title="Copy color code"
                >
                  <FontAwesomeIcon icon={faClipboard} className="mr-1" /> Copy
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="e.g., Primary Blue"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveColor}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {editingIndex !== null ? 'Save Changes' : 'Add Color'}
              </button>
              {editingIndex !== null && (
                <button
                  onClick={handleDeleteColor}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setShowColorModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contrast Checker Modal */}
      {showContrastChecker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              Contrast Checker
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Foreground Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={contrastForeground}
                      onChange={(e) => setContrastForeground(e.target.value)}
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded"
                    />
                    <input
                      type="text"
                      value={contrastForeground}
                      onChange={(e) => setContrastForeground(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                  {palette.colors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Quick select from palette:</p>
                      <div className="flex gap-1 flex-wrap">
                        {palette.colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setContrastForeground(color.color)}
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color.color }}
                            title={color.name || color.color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={contrastBackground}
                      onChange={(e) => setContrastBackground(e.target.value)}
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded"
                    />
                    <input
                      type="text"
                      value={contrastBackground}
                      onChange={(e) => setContrastBackground(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                  {palette.colors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Quick select from palette:</p>
                      <div className="flex gap-1 flex-wrap">
                        {palette.colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setContrastBackground(color.color)}
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color.color }}
                            title={color.name || color.color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Size
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTextSize('normal')}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${textSize === 'normal'
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                    >
                      Normal Text
                    </button>
                    <button
                      onClick={() => setTextSize('large')}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${textSize === 'large'
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                    >
                      Large Text
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {textSize === 'normal' ? 'Regular text (14pt+) and UI components' : 'Large text (18pt+ or 14pt+ bold)'}
                  </p>
                </div>
              </div>

              {/* Contrast Results */}
              <div className="space-y-4">
                {(() => {
                  const { contrastRatio } = getTextColorAndContrast(contrastBackground);
                  const actualContrast = calculateContrastRatio(contrastForeground, contrastBackground);

                  return (
                    <>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {actualContrast}:1
                        </div>
                        <div className="text-sm text-gray-500">Contrast Ratio</div>
                      </div>

                      {/* Preview */}
                      <div
                        className="p-4 rounded-lg border border-gray-300 dark:border-gray-600"
                        style={{
                          backgroundColor: contrastBackground,
                          color: contrastForeground
                        }}
                      >
                        <div className="space-y-3">
                          <div className="font-semibold mb-2 text-gray-500 text-xs uppercase tracking-wider">
                            {textSize === 'normal' ? 'Normal Text Preview' : 'Large Text Preview'}
                          </div>
                          {textSize === 'normal' ? (
                            <>
                              <div className="text-base">Sample heading text</div>
                              <div className="text-sm">Regular paragraph text for reading and general content</div>
                              <div className="text-xs">Small text for captions and fine print</div>
                            </>
                          ) : (
                            <>
                              <div className="text-xl font-bold">Large heading text</div>
                              <div className="text-lg">Large paragraph text for better readability</div>
                              <div className="text-base font-semibold">Large bold text for emphasis</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* WCAG Compliance */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">WCAG Compliance</h3>
                        <div className="space-y-2 text-sm">
                          <div className={`flex items-center gap-2 ${actualContrast >= 4.5 ? 'text-green-600' : 'text-red-600'}`}>
                            <FontAwesomeIcon icon={actualContrast >= 4.5 ? faCheck : faXmark} />
                            <span>AA Normal Text (4.5:1)</span>
                          </div>
                          <div className={`flex items-center gap-2 ${actualContrast >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                            <FontAwesomeIcon icon={actualContrast >= 3 ? faCheck : faXmark} />
                            <span>AA Large Text (3:1)</span>
                          </div>
                          <div className={`flex items-center gap-2 ${actualContrast >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                            <FontAwesomeIcon icon={actualContrast >= 7 ? faCheck : faXmark} />
                            <span>AAA Normal Text (7:1)</span>
                          </div>
                          <div className={`flex items-center gap-2 ${actualContrast >= 4.5 ? 'text-green-600' : 'text-red-600'}`}>
                            <FontAwesomeIcon icon={actualContrast >= 4.5 ? faCheck : faXmark} />
                            <span>AAA Large Text (4.5:1)</span>
                          </div>

                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            <div>
                <div className={`mt-6 flex gap-2 flex-col`}>
                  <span>Normal text is below 18pt (~24px) regular weight OR below 14pt (~18.66px) if it’s bold</span>
                  <span>Large Text is at least 18pt (~24px) regular weight OR at least 14pt (~18.66px) bold</span>
                </div>
              </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowContrastChecker(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Notification Popup */}
      {copyNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} />
            <span>{copyNotification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
