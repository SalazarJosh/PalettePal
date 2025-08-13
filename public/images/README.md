# Logo Implementation Guide

## Logo Component Features

The PalettePal logo is now implemented as an inline SVG with the following features:

### **Animation Support**
- **Animated Loading**: Set `isAnimated={true}` to enable beautiful sequential animations
- **Sequential Fade-in**: Each color segment animates in sequence (0.1s intervals)
- **Pulse Glow**: Continuous subtle glow effect after initial animation
- **Performance**: Animations only run when explicitly enabled

### **Component Props**
```tsx
<Logo 
  size="medium"           // 'small' | 'medium' | 'large'
  showText={true}         // Show/hide "PalettePal" text
  linkToHome={true}       // Make logo clickable to home
  isAnimated={false}      // Enable/disable animations
  isCentered={false}      // Center the logo horizontally
/>
```

### **Usage Examples**
```tsx
// Static logo in header
<Logo size="medium" showText={true} linkToHome={true} />

// Animated logo for loading screens
<Logo size="large" showText={true} linkToHome={false} isAnimated={true} />

// Compact logo only
<Logo size="small" showText={false} linkToHome={true} />
```

## Animation Details

### **Fade-in Sequence**
1. **Segment 1** (Cyan top-left): 0.1s delay
2. **Segment 2** (Light cyan): 0.2s delay
3. **Segment 3** (Blue top-right): 0.3s delay
4. **Segment 4** (Light blue): 0.4s delay
5. **Segment 5** (Purple bottom-right): 0.5s delay
6. **Segment 6** (Light purple): 0.6s delay
7. **Segment 7** (Dark blue bottom-left): 0.7s delay
8. **Segment 8** (Light lavender): 0.8s delay

### **Continuous Effects**
- **Pulse Glow**: Subtle brightness animation (3s cycle, starts after 1.5s)
- **Smooth Transitions**: All animations use ease-out timing

## Current Implementation
- **Gallery View**: Static logo (isAnimated=false)
- **PaletteEditor View**: Static logo (isAnimated=false)
- **Loading Screens**: Use isAnimated=true for engaging user experience

## Technical Notes
- **SVG-based**: Scalable vector graphics for crisp display at any size
- **CSS Animations**: Pure CSS keyframe animations for optimal performance
- **Conditional**: Animations only added to DOM when isAnimated=true
- **Accessible**: Respects user's motion preferences (can be enhanced)
