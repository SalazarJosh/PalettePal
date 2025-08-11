# PalettePal Next.js

A modern React-based color palette management tool built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Gallery View** - Browse all your palettes at a glance
- ✏️ **Palette Editor** - Create and edit color palettes with intuitive interface
- 🔍 **Search & Sort** - Find palettes by name, sort by date, name, or color count
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 💾 **Auto-Save** - Automatic saving to browser localStorage with manual save option
- 📁 **Import/Export** - Import and export individual palettes or full backups
- 🌙 **Dark Mode** - Supports system dark mode preference
- ⚡ **Fast Performance** - Built with Next.js static export for optimal loading

## Technology Stack

- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
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
│   └── globals.css     # Global styles and Tailwind imports
├── components/         # React components
│   ├── Gallery.tsx     # Main gallery component
│   └── PaletteEditor.tsx # Palette editing component
├── hooks/             # Custom React hooks
│   └── usePaletteStorage.ts # LocalStorage data management
└── types/            # TypeScript type definitions
    └── index.ts      # Palette and color type definitions
```

## Data Management

The app uses browser localStorage for data persistence with the following structure:

- **Palettes** - Array of palette objects with colors, metadata
- **Settings** - Auto-save preferences and welcome modal state
- **Backups** - Full application state for import/export

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling
- Functional components with React hooks

## Migration from Vanilla Version

This Next.js version maintains feature parity with the original vanilla HTML/CSS/JS version while adding:

- Modern React component architecture
- TypeScript type safety
- Improved performance with Next.js optimizations
- Better development experience with hot reloading
- Enhanced routing with dynamic URLs for palettes

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

- Vercel (recommended for Next.js)
- Netlify
- GitHub Pages
- Any static hosting service

Deploy the `out/` directory after running `npm run build`.
