'use client';

import { useState, useEffect } from 'react';
import { usePaletteStorage } from '@/hooks/usePaletteStorage';
import { Color, Palette } from '@/types';
import Link from 'next/link';
import Footer from './Footer';
import Logo from './Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faClipboard, faCheck, faEdit, faPlus, faExclamationTriangle, faTimes, faSearch, faXmark, faCircle, faAdjust, faMagic, faGripVertical } from '@fortawesome/free-solid-svg-icons';

// Validation functions
function isValidHexColor(hex: string): boolean {
  // Check if it's a valid 6-character hex color (with or without #)
  const hexRegex = /^#?[0-9A-Fa-f]{6}$/;
  return hexRegex.test(hex);
}

function normalizeHexColor(hex: string): string {
  // Ensure hex starts with # and is uppercase
  const cleaned = hex.replace('#', '').toUpperCase();
  return `#${cleaned}`;
}

function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

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

// Function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Function to convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Function to generate shades and tints for a color
function generateShadesTints(hex: string): { shades: string[]; tints: string[] } {
  const hsl = hexToHsl(hex);
  const currentLightness = hsl.l;

  // Calculate how many shades vs tints we can generate
  const maxShades = Math.floor(currentLightness / 12.5); // Every 12.5% darker
  const maxTints = Math.floor((100 - currentLightness) / 12.5); // Every 12.5% lighter

  // Generate up to 4 of each, but adjust based on available range
  const numShades = Math.min(4, maxShades);
  const numTints = Math.min(4, maxTints);

  // If we have fewer than 4 total, redistribute
  const totalVariations = numShades + numTints;
  let finalShades = numShades;
  let finalTints = numTints;

  if (totalVariations < 8) {
    if (numShades < 4 && maxTints > numTints) {
      finalTints = Math.min(8 - numShades, maxTints);
    } else if (numTints < 4 && maxShades > numShades) {
      finalShades = Math.min(8 - numTints, maxShades);
    }
  }

  const shades: string[] = [];
  const tints: string[] = [];

  // Generate shades (darker)
  for (let i = 1; i <= finalShades; i++) {
    const newLightness = Math.max(0, currentLightness - (i * (currentLightness / (finalShades + 1))));
    shades.push(hslToHex(hsl.h, hsl.s, newLightness));
  }

  // Generate tints (lighter)
  for (let i = 1; i <= finalTints; i++) {
    const newLightness = Math.min(100, currentLightness + (i * ((100 - currentLightness) / (finalTints + 1))));
    tints.push(hslToHex(hsl.h, hsl.s, newLightness));
  }
  tints.reverse();
  return { shades, tints };
}

// Function to generate a random color palette
function generateRandomPalette(): Color[] {
  const paletteTypes = [
    'monochromatic',
    'analogous', 
    'complementary',
    'triadic',
    'warm',
    'cool'
  ];
  
  const type = paletteTypes[Math.floor(Math.random() * paletteTypes.length)];
  
  // Generate a base hue (0-360)
  const baseHue = Math.floor(Math.random() * 360);
  
  switch (type) {
    case 'monochromatic':
      return generateMonochromaticPalette(baseHue);
    case 'analogous':
      return generateAnalogousPalette(baseHue);
    case 'complementary':
      return generateComplementaryPalette(baseHue);
    case 'triadic':
      return generateTriadicPalette(baseHue);
    case 'warm':
      return generateWarmPalette();
    case 'cool':
      return generateCoolPalette();
    default:
      return generateMonochromaticPalette(baseHue);
  }
}

function generateMonochromaticPalette(baseHue: number): Color[] {
  const colors: Color[] = [];
  const saturations = [75, 85, 65, 90];
  const lightnesses = [25, 45, 65, 85];
  
  for (let i = 0; i < 4; i++) {
    const hex = hslToHex(baseHue, saturations[i], lightnesses[i]);
    colors.push({
      color: hex,
      name: null
    });
  }
  
  return colors;
}

function generateAnalogousPalette(baseHue: number): Color[] {
  const colors: Color[] = [];
  const hueOffsets = [0, 30, 60, -30];
  
  for (let i = 0; i < 4; i++) {
    const hue = (baseHue + hueOffsets[i] + 360) % 360;
    const saturation = 70 + Math.random() * 20; // 70-90%
    const lightness = 40 + Math.random() * 30; // 40-70%
    const hex = hslToHex(hue, saturation, lightness);
    colors.push({
      color: hex,
      name: null
    });
  }
  
  return colors;
}

function generateComplementaryPalette(baseHue: number): Color[] {
  const colors: Color[] = [];
  const complementaryHue = (baseHue + 180) % 360;
  
  // Two shades of base color
  colors.push({
    color: hslToHex(baseHue, 80, 45),
    name: null
  });
  colors.push({
    color: hslToHex(baseHue, 70, 65),
    name: null
  });
  
  // Two shades of complementary color
  colors.push({
    color: hslToHex(complementaryHue, 80, 45),
    name: null
  });
  colors.push({
    color: hslToHex(complementaryHue, 70, 65),
    name: null
  });
  
  return colors;
}

function generateTriadicPalette(baseHue: number): Color[] {
  const colors: Color[] = [];
  const hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
  
  for (let i = 0; i < 3; i++) {
    const saturation = 75 + Math.random() * 15; // 75-90%
    const lightness = 45 + Math.random() * 20; // 45-65%
    const hex = hslToHex(hues[i], saturation, lightness);
    colors.push({
      color: hex,
      name: null
    });
  }
  
  // Add a neutral color
  colors.push({
    color: hslToHex(0, 0, 85),
    name: null
  });
  
  return colors;
}

function generateWarmPalette(): Color[] {
  const warmHues = [0, 15, 30, 45]; // Reds, oranges, yellows
  const colors: Color[] = [];
  
  for (const hue of warmHues) {
    const saturation = 70 + Math.random() * 20; // 70-90%
    const lightness = 40 + Math.random() * 30; // 40-70%
    const hex = hslToHex(hue, saturation, lightness);
    colors.push({
      color: hex,
      name: null
    });
  }
  
  return colors;
}

function generateCoolPalette(): Color[] {
  const coolHues = [180, 210, 240, 270]; // Cyans, blues, purples
  const colors: Color[] = [];
  
  for (const hue of coolHues) {
    const saturation = 70 + Math.random() * 20; // 70-90%
    const lightness = 40 + Math.random() * 30; // 40-70%
    const hex = hslToHex(hue, saturation, lightness);
    colors.push({
      color: hex,
      name: null
    });
  }
  
  return colors;
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
  showShadesTints: boolean;
  onReorderColors: (fromIndex: number, toIndex: number) => void;
}

function ColorGrid({ colors, onColorClick, onAddColor, gridSize, onCopyNotification, showShadesTints, onReorderColors }: ColorGridProps) {
  const maxColors = gridSize === 'small' ? 12 : gridSize === 'medium' ? 24 : 48;
  const gridCols = gridSize === 'small' ? 'grid-cols-2' : gridSize === 'medium' ? 'grid-cols-3' : 'grid-cols-4';
  const isCompactView = gridSize === 'large';

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedIndex;
    
    if (fromIndex !== null && fromIndex !== toIndex) {
      onReorderColors(fromIndex, toIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={`grid ${gridCols} gap-4 py-6`}>
      {colors.map((color, index) => {
        if (!showShadesTints) {
          // Normal single color display
          const { textColor, contrastRatio } = getTextColorAndContrast(color.color);
          const isDragged = draggedIndex === index;
          const isDraggedOver = dragOverIndex === index;
          
          return (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative transition-all duration-200 group overflow-hidden cursor-move ${
                isDragged ? 'opacity-50 scale-95' : ''
              } ${
                isDraggedOver ? 'ring-2 ring-primary-500 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: color.color,
                aspectRatio: '2/1',
                minHeight: '80px'
              }}
            >
              {/* Drag handle */}
              <div 
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-move"
                title="Drag to reorder"
              >
                <FontAwesomeIcon icon={faGripVertical} />
              </div>
              {/* Main display area - clickable for copying */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(color.color);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={isCompactView ? "swatch-button absolute inset-0 w-full h-full flex justify-between items-center p-3 text-center cursor-pointer transition-opacity" : "absolute inset-0 w-full h-full flex justify-between items-center p-3 text-center cursor-pointer transition-opacity"}
                style={{ color: textColor }}
                title={`Click to copy ${color.color}`}
              >
                {!isCompactView ? (
                  <>
                    <div className="flex-1">
                      {color.name && (
                        <div className="font-semibold text-lg mb-1 text-shadow-sm truncate w-full" title={color.name}>
                          {truncateWithEllipsis(color.name, 10)}
                        </div>
                      )}
                      <div className="font-mono text-xs opacity-90">
                        <span>{color.color.toUpperCase()}</span>
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
                  </>
                ) : (
                  // Compact view - no text content
                  <span className="flex-1 font-mono text-xs opacity-0">
                    {color.color.toUpperCase()}
                  </span>
                )}
              </button>

              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onColorClick(index);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm hover:shadow-md z-30"
                style={{
                  backgroundColor: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                  color: textColor === '#ffffff' ? '#000000' : '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = textColor === '#ffffff' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
                }}
                title="Edit color"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            </div>
          );
        } else {
          // Shades and tints display as horizontal bands
          const { shades, tints } = generateShadesTints(color.color);
          const { textColor: originalTextColor, contrastRatio } = getTextColorAndContrast(color.color);
          const isDragged = draggedIndex === index;
          const isDraggedOver = dragOverIndex === index;

          // Calculate band heights as percentages
          const totalBands = tints.length + 1 + shades.length; // tints + original + shades
          const originalHeightPercent = totalBands > 1 ? 50 : 100; // Original gets 50% when there are variations
          const variationHeightPercent = totalBands > 1 ? (100 - originalHeightPercent) / (totalBands - 1) : 0;

          return (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative transition-all duration-200 group overflow-hidden cursor-move ${
                isDragged ? 'opacity-50 scale-95' : ''
              } ${
                isDraggedOver ? 'ring-2 ring-primary-500 ring-offset-2' : ''
              }`}
              style={{
                aspectRatio: '2/1',
                minHeight: '80px'
              }}
            >
              {/* Drag handle */}
              <div 
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-move"
                title="Drag to reorder"
              >
                <FontAwesomeIcon icon={faGripVertical} />
              </div>
              {/* Tints (lighter bands at top) */}
              {tints.map((tint, tintIndex) => {
                const { textColor } = getTextColorAndContrast(tint);
                return (
                  <button
                    key={`tint-${tintIndex}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(tint);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="swatch-button absolute w-full transition-opacity flex items-center justify-center text-xs font-mono group"
                    style={{
                      backgroundColor: tint,
                      color: textColor,
                      top: `${tintIndex * variationHeightPercent}%`,
                      height: `${variationHeightPercent}%`,
                    }}
                    title={`Copy ${tint}`}
                  >
                    <span className="opacity-0 transition-opacity">
                      #{tint.slice(1).toUpperCase()}
                    </span>
                  </button>
                );
              })}

              {/* Original color band (larger, in middle) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(color.color);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={isCompactView ? "swatch-button absolute w-full flex justify-between items-center p-3 text-center cursor-pointer transition-opacity" : "absolute w-full flex justify-between items-center p-3 text-center cursor-pointer transition-opacity"}
                style={{
                  backgroundColor: color.color,
                  color: originalTextColor,
                  top: `${tints.length * variationHeightPercent}%`,
                  height: `${originalHeightPercent}%`,
                }}
                title={`Click to copy ${color.color}`}
              >
                {!isCompactView ? (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <FontAwesomeIcon icon={faCircle} className="opacity-70" style={{ fontSize: '.3rem' }} />
                        {color.name && (
                          <span className="font-semibold text-lg truncate" title={color.name}>
                            {truncateWithEllipsis(color.name, 10)}
                          </span>
                        )}
                      </div>
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
                  </>
                ) : (
                  // Compact view - no text content
                  <span className="flex-1 font-mono text-xs opacity-0">
                    {color.color.toUpperCase()}
                  </span>
                )}
              </button>

              {/* Shades (darker bands at bottom) */}
              {shades.map((shade, shadeIndex) => {
                const { textColor } = getTextColorAndContrast(shade);
                return (
                  <button
                    key={`shade-${shadeIndex}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(shade);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="swatch-button absolute w-full transition-opacity flex items-center justify-center text-xs font-mono group"
                    style={{
                      backgroundColor: shade,
                      color: textColor,
                      top: `${(tints.length * variationHeightPercent) + originalHeightPercent + (shadeIndex * variationHeightPercent)}%`,
                      height: `${variationHeightPercent}%`,
                    }}
                    title={`Copy ${shade}`}
                  >
                    <span className="opacity-0 transition-opacity">
                      #{shade.slice(1).toUpperCase()}
                    </span>
                  </button>
                );
              })}

              {/* Edit button for original */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onColorClick(index);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 w-7 h-7 rounded-full transition-all flex items-center justify-center shadow-sm hover:shadow-md z-30"
                style={{
                  backgroundColor: originalTextColor === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                  color: originalTextColor === '#ffffff' ? '#000000' : '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = originalTextColor === '#ffffff' ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = originalTextColor === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
                }}
                title="Edit color"
              >
                <FontAwesomeIcon icon={faEdit} className="text-xs" />
              </button>
            </div>
          );
        }
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
  const [showShadesTints, setShowShadesTints] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ show: boolean; existingIndex: number } | null>(null);
  
  // Validation states
  const [hexError, setHexError] = useState<string | null>(null);
  const [colorNameError, setColorNameError] = useState<string | null>(null);
  const [paletteNameError, setPaletteNameError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      const foundPalette = getPalette(paletteId);
      setPalette(foundPalette || null);
      if (foundPalette && !isEditingName) {
        setTempPaletteName(foundPalette.name);
      }
    }
  }, [paletteId, getPalette, isLoaded, isEditingName]);

  // Clear duplicate warning when color changes
  useEffect(() => {
    setDuplicateWarning(null);
  }, [selectedColor]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">
              <Logo isCentered={true} isAnimated={true} size="extraLarge" showText={false} linkToHome={false} />
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

  const handleGeneratePalette = () => {
    if (!palette) return;
    
    const paletteTypes = [
      'monochromatic',
      'analogous', 
      'complementary',
      'triadic',
      'warm',
      'cool'
    ];
    const type = paletteTypes[Math.floor(Math.random() * paletteTypes.length)];
    const generatedColors = (() => {
      switch (type) {
      case 'monochromatic':
        return generateMonochromaticPalette(Math.floor(Math.random() * 360));
      case 'analogous':
        return generateAnalogousPalette(Math.floor(Math.random() * 360));
      case 'complementary':
        return generateComplementaryPalette(Math.floor(Math.random() * 360));
      case 'triadic':
        return generateTriadicPalette(Math.floor(Math.random() * 360));
      case 'warm':
        return generateWarmPalette();
      case 'cool':
        return generateCoolPalette();
      default:
        return generateMonochromaticPalette(Math.floor(Math.random() * 360));
      }
    })();
    updatePalette(palette.id, { colors: generatedColors });
    setPalette({ ...palette, colors: generatedColors });
    
    // Show notification about the generated palette
    setCopyNotification(`Generated random ${type} palette!`);
    setTimeout(() => setCopyNotification(null), 3000);
  };

  const handleSaveColor = () => {
    if (!palette) return;

    // Clear previous errors
    setHexError(null);
    setColorNameError(null);

    // Validate hex color
    if (!isValidHexColor(selectedColor)) {
      setHexError('Please enter a valid 6-character hex color (e.g., #FF0000)');
      return;
    }

    // Validate color name length
    if (colorName.trim().length > 10) {
      setColorNameError('Color name must be 10 characters or less');
      return;
    }

    // Normalize the hex color
    const normalizedHex = normalizeHexColor(selectedColor);

    const newColor: Color = {
      color: normalizedHex,
      name: colorName.trim() || null
    };

    // Check for duplicate colors (both when adding and editing)
    const existingColorIndex = palette.colors.findIndex((color, index) => 
      color.color.toLowerCase() === normalizedHex.toLowerCase() && 
      index !== editingIndex // Exclude the color being edited
    );
    
    if (existingColorIndex !== -1 && !duplicateWarning) {
      // Color already exists, show warning
      setDuplicateWarning({ show: true, existingIndex: existingColorIndex });
      return;
    }

    // Clear any duplicate warning
    setDuplicateWarning(null);

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
    
    // Clear all validation errors and close modal
    setHexError(null);
    setColorNameError(null);
    setShowColorModal(false);
  };

  const handleConfirmDuplicate = () => {
    if (!palette) return;

    // Normalize the hex color
    const normalizedHex = normalizeHexColor(selectedColor);

    const newColor: Color = {
      color: normalizedHex,
      name: colorName.trim() || null
    };

    let newColors: Color[];
    if (editingIndex !== null) {
      // Edit existing color (even if it creates a duplicate)
      newColors = [...palette.colors];
      newColors[editingIndex] = newColor;
    } else {
      // Add the duplicate color
      newColors = [...palette.colors, newColor];
    }

    updatePalette(palette.id, { colors: newColors });
    console.log('PaletteEditor: Saved color with duplicate confirmation, new count:', newColors.length);
    setPalette({ ...palette, colors: newColors });
    
    // Clear all validation errors and warnings
    setDuplicateWarning(null);
    setHexError(null);
    setColorNameError(null);
    setShowColorModal(false);
  };

  const handleCancelDuplicate = () => {
    setDuplicateWarning(null);
    // Keep the modal open so user can modify the color
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

    if (confirm('Clear all colors from the palette? This action cannot be undone.')) {
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

    // Clear previous error
    setPaletteNameError(null);

    // Validate palette name length
    if (tempPaletteName.trim().length > 20) {
      setPaletteNameError('Palette name must be 20 characters or less');
      return;
    }

    console.log('PaletteEditor: Saving palette name:', tempPaletteName.trim());
    updatePalette(palette.id, { name: tempPaletteName.trim() });
    setPalette({ ...palette, name: tempPaletteName.trim() });
    setIsEditingName(false);
  };

  const handleCancelNameEdit = () => {
    setTempPaletteName(palette?.name || '');
    setIsEditingName(false);
    setPaletteNameError(null);
  };

  const handleCopyNotification = (message: string) => {
    setCopyNotification(message);
    setTimeout(() => setCopyNotification(null), 3000);
  };

  const handleReorderColors = (fromIndex: number, toIndex: number) => {
    if (!palette) return;
    
    const newColors = [...palette.colors];
    const [movedColor] = newColors.splice(fromIndex, 1);
    newColors.splice(toIndex, 0, movedColor);
    
    const updatedPalette = { ...palette, colors: newColors };
    updatePalette(palette.id, { colors: newColors });
    setPalette(updatedPalette);
    
    // Show notification
    setCopyNotification(`Moved ${movedColor.name ? movedColor.name : movedColor.color} to position ${toIndex + 1}`);
    console.log(movedColor);
    setTimeout(() => setCopyNotification(null), 2000);
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
    <div className="sticky-footer-container bg-gray-50 dark:bg-gray-900">
      <div className="sticky-footer-content">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-6">
                <Logo size="medium" showText={true} linkToHome={true} />
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        {/* Navigation and Title */}
        <div className="py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div>
              {onBack ? (
                <button
                  onClick={onBack}
                  className="mb-4 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  ← Gallery
                </button>
              ) : (
                <Link
                  href="/"
                  className="mb-4 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  ← Gallery
                </Link>
              )}
            </div>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={tempPaletteName}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 20) {
                            setTempPaletteName(value);
                            setPaletteNameError(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSavePaletteName();
                          if (e.key === 'Escape') handleCancelNameEdit();
                        }}
                        className={`text-xl font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded px-2 py-1 ${
                          paletteNameError 
                            ? 'border-red-500 dark:border-red-400' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        autoFocus
                      />
                      {paletteNameError && (
                        <p className="text-red-500 text-xs mt-1">{paletteNameError}</p>
                      )}
                      <p className={tempPaletteName.length === 20 ? "text-red-500 text-xs mt-1" : "text-gray-500 text-xs mt-1"}>{tempPaletteName.length}/20</p>
                    </div>
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{palette.name}</h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="Edit palette name"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                )}
                {!isEditingName ? <p className="text-sm text-gray-500" id="colorCount">{palette.colors.length} colors</p> : null}
              </div>
            </div>
            
          </div>
        </div>

        {/* Palette Controls */}
        <div className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {palette.colors.length > 0 && (
                <button
                  onClick={handleAddColor}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add Color
                </button>
              )}
              <button
                onClick={() => setShowContrastChecker(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSearch} />
                Contrast Checker
              </button>
              <button
                onClick={() => setShowShadesTints(!showShadesTints)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showShadesTints
                    ? 'bg-gray-100 dark:bg-gray-300 text-gray-700 dark:text-gray-900 hover:bg-gray-200 dark:hover:bg-gray-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                <FontAwesomeIcon icon={faAdjust} />
                Shades & Tints
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleClearPalette}
                disabled={palette.colors.length === 0}
                className="px-4 py-2 bg-red-50 dark:bg-red-700 text-red-600 dark:text-red-50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleExportPalette}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Export
              </button>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  View:
                </label>
                <select
                  value={palette.gridSize === 'large' ? 'compact' : 'detailed'}
                  onChange={(e) => {
                    const newView = e.target.value as 'compact' | 'detailed';
                    const newGridSize = newView === 'compact' ? 'large' : 'small';
                    updatePalette(palette.id, { gridSize: newGridSize });
                    setPalette({ ...palette, gridSize: newGridSize });
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                >
                  <option value="compact">Compact</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {palette.colors.length > 0 ? (
          <ColorGrid
            colors={palette.colors}
            onColorClick={handleColorClick}
            onAddColor={handleAddColor}
            gridSize={palette.gridSize}
            onCopyNotification={handleCopyNotification}
            showShadesTints={showShadesTints}
            onReorderColors={handleReorderColors}
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
              Add your first color or generate a random palette to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleAddColor}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add First Color
              </button>
              <button
                onClick={handleGeneratePalette}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faMagic} />
                Generate Palette
              </button>
            </div>
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
                    value={isValidHexColor(selectedColor) ? selectedColor : '#000000'}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      setHexError(null);
                    }}
                    className="w-16 h-12 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => {
                        setSelectedColor(e.target.value);
                        setHexError(null);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        hexError 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="#000000"
                    />
                    {hexError && (
                      <p className="text-red-500 text-xs mt-1">{hexError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name (optional, max 10 chars)
                </label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 10) {
                      setColorName(value);
                      setColorNameError(null);
                    }
                  }}
                  placeholder="e.g., Primary"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    colorNameError 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {colorNameError && (
                    <p className="text-red-500 text-xs">{colorNameError}</p>
                  )}
                  <p className={colorName.length === 10 ? "text-red-500 text-xs ml-auto" : "text-gray-500 text-xs ml-auto"}>{colorName.length}/10</p>
                </div>
              </div>
            </div>

            {/* Duplicate Warning */}
            {duplicateWarning?.show && palette && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 dark:text-yellow-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Color Already Exists
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                      The color <strong>{selectedColor.toUpperCase()}</strong> already exists in this palette
                      {palette.colors[duplicateWarning.existingIndex]?.name && 
                        ` as "${palette.colors[duplicateWarning.existingIndex].name}"`
                      }. 
                      {editingIndex !== null 
                        ? 'Do you want to change this color to match the existing one?' 
                        : 'Do you want to add it again?'
                      }
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmDuplicate}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                      >
                        {editingIndex !== null ? 'Save Anyway' : 'Add Anyway'}
                      </button>
                      <button
                        onClick={handleCancelDuplicate}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveColor}
                disabled={!!duplicateWarning?.show}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  duplicateWarning?.show 
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
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
                onClick={() => {
                  setShowColorModal(false);
                  setDuplicateWarning(null);
                  setHexError(null);
                  setColorNameError(null);
                }}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                <FontAwesomeIcon icon={faSearch} className="mr-3" />
                Contrast Checker
              </h2>
              <button
                onClick={() => setShowContrastChecker(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

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
                <hr className="my-4 border-gray-300 dark:border-gray-600" />
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
                <hr className="my-4 border-gray-300 dark:border-gray-600" />
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
                  <p className="text-xs text-gray-500 mt-2">
                    {textSize === 'normal' ? 'Normal text is below 18pt (~24px) regular weight OR below 14pt (~18.66px) if it’s bold' :
                     'Large Text is at least 18pt (~24px) regular weight OR at least 14pt (~18.66px) bold'}
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
                      <div className="font-semibold mb-2 text-gray-500 text-xs uppercase tracking-wider">
                        {textSize === 'normal' ? 'Normal Text Preview' : 'Large Text Preview'}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
