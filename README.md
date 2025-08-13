# PalettePal Next.js

A modern React-based color palette management tool built with Next.js, TypeScript, and Tailwind CSS. An accessibility-first color palette tool with advanced features for designers and developers.

## Features

### Core Functionality
- 🎨 **Gallery View** - Browse all your palettes at a glance with grid/list views
- ✏️ **Palette Editor** - Create and edit color palettes with intuitive interface
- 🔍 **Search & Sort** - Find palettes by name, sort by date, name, or color count
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 💾 **Auto-Save** - Automatic saving to browser localStorage with manual save option
- 📁 **Import/Export** - Import and export individual palettes or full backups
- 🌙 **Dark Mode** - Supports system dark mode preference
- ⚡ **Fast Performance** - Built with Next.js static export for optimal loading

### Advanced Color Features
- 🎲 **Palette Generation** - Generate random palettes using color theory algorithms:
  - Monochromatic (same hue, different saturations/lightness)
  - Analogous (adjacent colors on color wheel)
  - Complementary (opposite colors)
  - Triadic (evenly spaced colors)
  - Warm palettes (reds, oranges, yellows)
  - Cool palettes (blues, cyans, purples)
- 🌈 **Shades & Tints** - View automatic color variations with horizontal band overlay
- 📋 **Click-to-Copy** - Copy hex codes by clicking any color or variation
- 🔄 **Duplicate Detection** - Smart warnings when adding duplicate colors

### Accessibility & Design
- ♿ **Contrast Checker** - Built-in WCAG compliance checker with:
  - Real-time contrast ratio calculation
  - AA/AAA compliance indicators
  - Preview with normal/large text sizes
  - Quick palette color selection
- 🎯 **Visual Accessibility** - High contrast buttons and clear visual hierarchy
- 📏 **View Options** - Compact (4 columns) and Detailed (2 columns) grid views
- 📱 **Mobile-First** - Optimized touch interfaces and responsive layouts

### Input Validation & UX
- ✅ **Smart Validation** - Input validation for:
  - Hex colors (6-character format with auto-normalization)
  - Color names (10 character limit with counter)
  - Palette names (15 character limit with counter)
- 📝 **Character Limits** - Real-time character counting and enforcement
- 🔤 **Text Truncation** - Automatic ellipsis for long names with hover tooltips
- 🚨 **Error Handling** - Clear error messages with visual feedback

### User Experience
- 🏷️ **Inline Editing** - Click to edit palette and color names directly
- 🗂️ **Sticky Footer** - Consistent branding and stats across all pages
- 🔔 **Notifications** - Success feedback for copy actions and palette generation
- 📊 **Statistics** - Live count of palettes and colors in footer
- 🎛️ **Settings Panel** - Auto-save toggle, data management, and storage info

## Technology Stack

- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework with dark mode
- **Font Awesome** - Professional icon library (React components)
- **Local Storage** - Client-side data persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PalettePalNext
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This creates an optimized static build in the `out/` directory that can be deployed to any static hosting service.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Gallery page (home)
│   ├── palette/
│   │   └── [id]/
│   │       └── page.tsx # Dynamic palette editor page
│   └── globals.css     # Global styles, Tailwind imports, and sticky footer CSS
├── components/         # React components
│   ├── Gallery.tsx     # Main gallery component with search, sort, and grid views
│   ├── PaletteEditor.tsx # Palette editing with color tools and validation
│   └── Footer.tsx      # Reusable footer with stats and branding
├── hooks/             # Custom React hooks
│   └── usePaletteStorage.ts # LocalStorage data management with auto-save
└── types/            # TypeScript type definitions
    └── index.ts      # Palette, color, and component type definitions
```

## Key Components

### Gallery (`/`)
- **Palette Overview** - Grid/list view of all palettes with color previews
- **Search & Filter** - Real-time search with multiple sorting options
- **Palette Management** - Create, duplicate, delete, import/export operations
- **Settings Modal** - Auto-save configuration and data management
- **Welcome Modal** - Onboarding for new users with feature overview

### Palette Editor (`/palette/[id]`)
- **Color Grid** - Interactive color swatches with copy-to-clipboard
- **Shades & Tints** - Toggle overlay showing color variations
- **Contrast Checker** - WCAG compliance testing with live preview
- **Color Modal** - Add/edit colors with validation and duplicate detection
- **Palette Generation** - Six color theory algorithms for inspiration
- **View Controls** - Switch between compact and detailed layouts

### Footer (Component)
- **Statistics** - Live count of palettes and colors (Gallery only)
- **Branding** - Developer attribution and technology stack
- **Social Links** - GitHub and LinkedIn profile links
- **Responsive** - Adapts layout for mobile and desktop

## Data Management

The app uses browser localStorage for data persistence with enhanced structure:

### Storage Schema
- **Palettes** - Array of palette objects with colors, metadata, and grid preferences
- **Settings** - Auto-save preferences, welcome modal state, and user preferences
- **Validation** - Real-time input validation with error states

### Data Features
- **Auto-Save** - Configurable automatic saving with manual override
- **Backup System** - Full application state export/import with metadata
- **Data Validation** - Type-safe operations with error handling
- **Storage Info** - Real-time display of palette and color counts

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project follows modern React and TypeScript best practices:
- **Functional Components** - React hooks for state management
- **TypeScript Strict Mode** - Type safety with strict compiler settings
- **ESLint Configuration** - Next.js recommended linting rules
- **Tailwind CSS** - Utility-first styling with dark mode support
- **Component Architecture** - Reusable, composable components
- **Custom Hooks** - Encapsulated logic for data management
- **Input Validation** - Client-side validation with real-time feedback

### Color Theory Implementation
- **HSL Color Space** - Better color manipulation than RGB
- **Accessibility First** - WCAG contrast ratio calculations
- **Color Algorithms** - Six different palette generation methods
- **Visual Feedback** - Real-time preview and validation

## Recent Updates

### Version 2.0 Features
- ✨ **Random Palette Generation** - Six color theory algorithms
- 🎨 **Shades & Tints Visualization** - Horizontal band overlay system
- ♿ **Enhanced Accessibility** - WCAG compliance checker with live preview
- 🔍 **Duplicate Detection** - Smart warnings for duplicate colors
- ✅ **Input Validation** - Character limits and format validation
- 📝 **Text Truncation** - Ellipsis handling with hover tooltips
- 🏷️ **Inline Editing** - Click-to-edit for names and labels
- 🗂️ **Sticky Footer** - Consistent UI with optional statistics
- 📱 **Mobile Optimization** - Touch-friendly interfaces and responsive design

### Accessibility Improvements
- **Contrast Ratios** - Real-time WCAG AA/AAA compliance checking
- **Keyboard Navigation** - Full keyboard accessibility support
- **Screen Reader Support** - Proper ARIA labels and semantic HTML
- **High Contrast** - Clear visual hierarchy and color-blind friendly design
- **Touch Targets** - Mobile-optimized button sizes and spacing

## Migration from Vanilla Version

This Next.js version significantly extends the original vanilla HTML/CSS/JS version with:

### Enhanced Features
- **Modern Architecture** - React component system with TypeScript
- **Advanced Color Tools** - Palette generation and shades/tints
- **Accessibility Tools** - Built-in contrast checker and WCAG compliance
- **Input Validation** - Real-time validation with error handling
- **Better UX** - Inline editing, notifications, and responsive design
- **Professional UI** - Font Awesome icons and polished interface

### Performance Improvements
- **Next.js Optimizations** - Static generation and code splitting
- **React Hooks** - Efficient state management and re-rendering
- **TypeScript Benefits** - Compile-time error detection and IntelliSense
- **Tailwind CSS** - Optimized CSS bundle with unused style purging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Deployment

The app is configured for static export and can be deployed to:

- GitHub Pages (This is what I'm using since it's free)
- Vercel (recommended for Next.js)
- Netlify
- Any static hosting service

Deploy the `out/` directory after running `npm run build`.
