import PaletteEditor from "@/components/PaletteEditor";

interface PageProps {
  params: {
    id: string;
  };
}

// Generate static params for static export
export async function generateStaticParams() {
  // For static export, we'll generate a default palette ID
  // Other palette IDs will be handled client-side through the Gallery component
  return [
    { id: 'default' },
  ];
}

export default function PalettePage({ params }: PageProps) {
  return <PaletteEditor paletteId={params.id} />;
}
