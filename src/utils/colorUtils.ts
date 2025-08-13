import { Color } from '@/types';

// Validation functions
export function isValidHexColor(hex: string): boolean {
  const hexRegex = /^#?[0-9A-Fa-f]{6}$/;
  return hexRegex.test(hex);
}

export function normalizeHexColor(hex: string): string {
  const cleaned = hex.replace('#', '').toUpperCase();
  return `#${cleaned}`;
}

export function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Utility function to calculate contrast ratio between two colors
export function calculateContrastRatio(foreground: string, background: string): number {
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
export function getTextColorAndContrast(hexColor: string) {
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
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
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
export function hslToHex(h: number, s: number, l: number): string {
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
export function generateShadesTints(hex: string): { shades: string[]; tints: string[] } {
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
export function generateRandomPalette(): Color[] {
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
