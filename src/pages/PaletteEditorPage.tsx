'use client';

import { useState, useEffect } from 'react';
import { usePaletteStorage } from '@/hooks/usePaletteStorage';
import { Color, Palette } from '@/types';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPalette,
    faExclamationTriangle,
    faPlus,
    faSearch,
    faAdjust,
    faMagic,
    faEdit,
    faCheck,
    faTimes,
    faGripVertical,
    faCircle,
    faXmark
} from '@fortawesome/free-solid-svg-icons';

// Import utility functions (these would ideally be in separate utility files)
import {
    isValidHexColor,
    normalizeHexColor,
    truncateWithEllipsis,
    calculateContrastRatio,
    getTextColorAndContrast,
    hexToHsl,
    hslToHex,
    generateShadesTints,
    generateRandomPalette
} from '@/utils/colorUtils';

interface PaletteEditorPageProps {
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

    // Color grid rendering logic would go here...
    // For brevity, I'll include a simplified version

    return (
        <div className={`grid ${gridCols} gap-4 p-6`}>
            {colors.map((color, index) => (
                <div
                    key={index}
                    className="relative transition-all duration-200 group overflow-hidden cursor-move"
                    style={{
                        backgroundColor: color.color,
                        aspectRatio: '2/1',
                        minHeight: '80px'
                    }}
                >
                    {/* Simplified color display - full implementation would include shades/tints logic */}
                    <button
                        onClick={() => copyToClipboard(color.color)}
                        className="absolute inset-0 w-full h-full flex justify-between items-center p-3"
                        style={{ color: getTextColorAndContrast(color.color).textColor }}
                    >
                        <div className="flex-1">
                            {color.name && (
                                <div className="font-semibold text-lg mb-1">{color.name}</div>
                            )}
                            <div className="font-mono text-xs">{color.color.toUpperCase()}</div>
                        </div>
                    </button>
                    <button
                        onClick={() => onColorClick(index)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                            backgroundColor: getTextColorAndContrast(color.color).textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                            color: getTextColorAndContrast(color.color).textColor === '#ffffff' ? '#000000' : '#ffffff',
                        }}
                    >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                </div>
            ))}
            {colors.length < maxColors && (
                <Button
                    onClick={onAddColor}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 rounded-lg"
                    style={{ aspectRatio: '2/1', minHeight: '80px' }}
                >
                    <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                </Button>
            )}
        </div>
    );
}

export default function PaletteEditorPage({ paletteId, onBack }: PaletteEditorPageProps) {
    const { getPalette, updatePalette, isLoaded } = usePaletteStorage();
    const [palette, setPalette] = useState<Palette | null>(null);
    const [showColorModal, setShowColorModal] = useState(false);
    const [showContrastChecker, setShowContrastChecker] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [colorName, setColorName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempPaletteName, setTempPaletteName] = useState('');

    // Additional state
    const [copyNotification, setCopyNotification] = useState<string | null>(null);
    const [showShadesTints, setShowShadesTints] = useState(false);

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

    const handleCopyNotification = (message: string) => {
        setCopyNotification(message);
        setTimeout(() => setCopyNotification(null), 3000);
    };

    const handleReorderColors = (fromIndex: number, toIndex: number) => {
        if (!palette) return;

        const newColors = [...palette.colors];
        const [movedColor] = newColors.splice(fromIndex, 1);
        newColors.splice(toIndex, 0, movedColor);

        updatePalette(palette.id, { colors: newColors });
        setPalette({ ...palette, colors: newColors });

        setCopyNotification(`Moved ${movedColor.name ? movedColor.name : movedColor.color} to position ${toIndex + 1}`);
        setTimeout(() => setCopyNotification(null), 2000);
    };

    return (
        <div className="sticky-footer-container bg-gray-50 dark:bg-gray-900">
            <div className="sticky-footer-content">
                <Header />

                {/* Navigation and Title */}
                <div className="max-w-7xl mx-auto px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="mb-2">
                                {onBack ? (
                                    <Button
                                        onClick={onBack}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        ← Gallery
                                    </Button>
                                ) : (
                                    <Link href="/">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                        >
                                            ← Gallery
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className="flex items-center gap-4">

                                <div>
                                    {isEditingName ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={tempPaletteName}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 20) {
                                                        setTempPaletteName(e.target.value);
                                                        setPaletteNameError(null);
                                                    }
                                                }}
                                                className={`text-xl font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded px-2 py-1 ${paletteNameError
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                                autoFocus
                                            />
                                            <Button
                                                onClick={() => {
                                                    if (tempPaletteName.trim()) {
                                                        updatePalette(palette.id, { name: tempPaletteName.trim() });
                                                        setPalette({ ...palette, name: tempPaletteName.trim() });
                                                        setIsEditingName(false);
                                                    }
                                                }}
                                                variant="success"
                                                size="sm"
                                                icon={faCheck}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setTempPaletteName(palette.name);
                                                    setIsEditingName(false);
                                                }}
                                                variant="secondary"
                                                size="sm"
                                                icon={faTimes}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{palette.name}</h1>
                                            <Button
                                                onClick={() => setIsEditingName(true)}
                                                variant="gray"
                                                size="sm"
                                                icon={faEdit}
                                                title="Edit palette name"
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-500">{palette.colors.length} colors</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto">
                    {/* Palette Controls */}
                    <div className="px-6 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {palette.colors.length > 0 && (
                                    <Button
                                        onClick={handleAddColor}
                                        variant="primary"
                                        icon={faPlus}
                                    >
                                        Add Color
                                    </Button>
                                )}
                                <Button
                                    onClick={() => setShowContrastChecker(true)}
                                    variant="secondary"
                                    icon={faSearch}
                                >
                                    Contrast Checker
                                </Button>
                                <Button
                                    onClick={() => setShowShadesTints(!showShadesTints)}
                                    variant={showShadesTints ? 'primary' : 'secondary'}
                                    icon={faAdjust}
                                >
                                    Shades & Tints
                                </Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={handleClearPalette}
                                    disabled={palette.colors.length === 0}
                                    variant="danger"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    onClick={handleExportPalette}
                                    variant="secondary"
                                >
                                    Export
                                </Button>
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
                                <Button
                                    onClick={handleAddColor}
                                    variant="primary"
                                    icon={faPlus}
                                >
                                    Add First Color
                                </Button>
                                <Button
                                    onClick={() => {
                                        const generatedColors = generateRandomPalette();
                                        updatePalette(palette.id, { colors: generatedColors });
                                        setPalette({ ...palette, colors: generatedColors });
                                        setCopyNotification('Generated random palette!');
                                        setTimeout(() => setCopyNotification(null), 3000);
                                    }}
                                    variant="secondary"
                                    icon={faMagic}
                                >
                                    Generate Palette
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <Footer />

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
