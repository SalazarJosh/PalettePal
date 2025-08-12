'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const saveToStorage = useCallback((newPalettes: Palette[], newAutoSave: boolean = autoSaveEnabled) => {
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
  }, [autoSaveEnabled]);

  // Auto-save effect
  useEffect(() => {
    if (isLoaded && autoSaveEnabled && palettes.length > 0) {
      saveToStorage(palettes, autoSaveEnabled);
    }
  }, [palettes, autoSaveEnabled, isLoaded, saveToStorage]);

  const updatePalettes = useCallback((newPalettes: Palette[]) => {
    setPalettes(newPalettes);
  }, []);

  const addPalette = useCallback((palette: Palette) => {
    const newPalettes = [...palettes, palette];
    updatePalettes(newPalettes);
  }, [palettes, updatePalettes]);

  const updatePalette = useCallback((paletteId: string, updates: Partial<Palette>) => {
    const newPalettes = palettes.map(p => 
      p.id === paletteId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    );
    updatePalettes(newPalettes);
  }, [palettes, updatePalettes]);

  const deletePalette = useCallback((paletteId: string) => {
    const newPalettes = palettes.filter(p => p.id !== paletteId);
    updatePalettes(newPalettes);
  }, [palettes, updatePalettes]);

  const getPalette = useCallback((paletteId: string) => {
    return palettes.find(p => p.id === paletteId);
  }, [palettes]);

  // Welcome modal storage
  const shouldShowWelcome = useCallback((): boolean => {
    if (typeof window === 'undefined') return true;
    try {
      const welcomeData = localStorage.getItem(WELCOME_KEY);
      if (welcomeData === null) return true;
      return JSON.parse(welcomeData);
    } catch {
      return true;
    }
  }, []);

  const setShowWelcome = useCallback((show: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(WELCOME_KEY, JSON.stringify(show));
    } catch (error) {
      console.error('Error saving welcome preference:', error);
    }
  }, []);

  const manualSave = useCallback(() => {
    saveToStorage(palettes, autoSaveEnabled);
  }, [saveToStorage, palettes, autoSaveEnabled]);

  const toggleAutoSave = useCallback(() => {
    const newAutoSave = !autoSaveEnabled;
    setAutoSaveEnabled(newAutoSave);
    saveToStorage(palettes, newAutoSave);
  }, [autoSaveEnabled, saveToStorage, palettes]);

  const refreshFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const data: AppData = JSON.parse(savedData);
        console.log('usePaletteStorage: Refreshing from localStorage, found palettes:', data.palettes?.length);
        setPalettes(data.palettes || []);
        setAutoSaveEnabled(data.autoSaveEnabled ?? true);
      }
    } catch (error) {
      console.error('Error refreshing from storage:', error);
    }
  }, []);

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
    saveToStorage,
    refreshFromStorage
  };
}
