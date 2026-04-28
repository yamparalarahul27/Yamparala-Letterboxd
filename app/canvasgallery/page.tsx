import type { Metadata } from "next";
import BeyCanvasGallery from "@/components/canvas/BeyCanvasGallery";

export const metadata: Metadata = {
  title: "Bey Canvas Gallery — Beyblade Metal Fusion",
  description:
    "Explore every Beyblade in a draggable, zoomable canvas gallery with quick stats and detail previews.",
};

export default function CanvasGalleryPage() {
  return <BeyCanvasGallery />;
}
