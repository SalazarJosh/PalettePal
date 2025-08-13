import PaletteEditorPage from "@/pages/PaletteEditorPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate static params for static export
export async function generateStaticParams() {
  // For static export, we'll generate a default palette ID
  // Other palette IDs will be handled client-side through the Gallery component
  return [
    { id: 'default' },
  ];
}

export default async function PalettePage({ params }: PageProps) {
  const { id } = await params;
  return <PaletteEditorPage paletteId={id} />;
}
