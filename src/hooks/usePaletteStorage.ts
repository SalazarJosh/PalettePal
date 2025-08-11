'use client';

import { useState, useEffect } from 'react';
import { Palette, AppData } from '@/types';

const STORAGE_KEY = 'palettePal_data';
const WELCOME_KEY = 'palettePal_showWelcome';

export function usePaletteStorage() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const data: AppData = JSON.parse(savedData);
        setPalettes(data.palettes || []);
        setAutoSaveEnabled(data.autoSaveEnabled ?? true);
      } else {
        // Create default palette
        const defaultPalette: Palette = {
          id: 'default',
          name: 'My First Palette',
          colors: [],
          gridSize: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPalettes([defaultPalette]);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      // Fallback to default
      const defaultPalette: Palette = {
        id: 'default',
        name: 'My First Palette',
        colors: [],
        gridSize: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPalettes([defaultPalette]);
    }
    
    setIsLoaded(true);
  }, []);

  // Save data to localStorage
  const saveToStorage = (newPalettes: Palette[], newAutoSave: boolean = autoSaveEnabled) => {
    if (typeof window === 'undefined') return;

    try {
      const dataToSave: AppData = {
        palettes: newPalettes,
        currentPaletteId: newPalettes[0]?.id || 'default',
        autoSaveEnabled: newAutoSave,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (isLoaded && autoSaveEnabled && palettes.length > 0) {
      saveToStorage(palettes, autoSaveEnabled);
    }
  }, [palettes, autoSaveEnabled, isLoaded]);

  const updatePalettes = (newPalettes: Palette[]) => {
    setPalettes(newPalettes);
  };

  const addPalette = (palette: Palette) => {
    const newPalettes = [...palettes, palette];
    updatePalettes(newPalettes);
  };

  const updatePalette = (paletteId: string, updates: Partial<Palette>) => {
    const newPalettes = palettes.map(p => 
      p.id === paletteId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    );
    updatePalettes(newPalettes);
  };

  const deletePalette = (paletteId: string) => {
    const newPalettes = palettes.filter(p => p.id !== paletteId);
    updatePalettes(newPalettes);
  };

  const getPalette = (paletteId: string) => {
    return palettes.find(p => p.id === paletteId);
  };

  // Welcome modal storage
  const shouldShowWelcome = (): boolean => {
    if (typeof window === 'undefined') return true;
    try {
      const welcomeData = localStorage.getItem(WELCOME_KEY);
      if (welcomeData === null) return true;
      return JSON.parse(welcomeData);
    } catch {
      return true;
    }
  };

  const setShowWelcome = (show: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(WELCOME_KEY, JSON.stringify(show));
    } catch (error) {
      console.error('Error saving welcome preference:', error);
    }
  };

  const manualSave = () => {
    saveToStorage(palettes, autoSaveEnabled);
  };

  const toggleAutoSave = () => {
    const newAutoSave = !autoSaveEnabled;
    setAutoSaveEnabled(newAutoSave);
    saveToStorage(palettes, newAutoSave);
  };

  return {
    palettes,
    autoSaveEnabled,
    isLoaded,
    updatePalettes,
    addPalette,
    updatePalette,
    deletePalette,
    getPalette,
    shouldShowWelcome,
    setShowWelcome,
    manualSave,
    toggleAutoSave,
    saveToStorage
  };
}
