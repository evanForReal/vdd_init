export type ArtCategory = "abstract" | "modern" | "non-western";

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  museum: string;
  /** Wikimedia Commons file page title, without the "File:" prefix. */
  commonsFile: string;
  categories: ArtCategory[];
}

// Curated from Wikimedia Commons — all public domain. Image bytes are
// fetched client-side at render time via Commons' Special:FilePath
// redirect, so nothing is bundled with the app.
export const ARTWORKS: Artwork[] = [
  {
    id: "kandinsky-composition-vii",
    title: "Composition VII",
    artist: "Wassily Kandinsky",
    year: "1913",
    museum: "Tretyakov Gallery",
    commonsFile: "Vassily Kandinsky, 1913 - Composition 7.jpg",
    categories: ["abstract", "modern"],
  },
  {
    id: "af-klint-ten-largest-7",
    title: "The Ten Largest, No. 7, Adulthood",
    artist: "Hilma af Klint",
    year: "1907",
    museum: "Moderna Museet",
    commonsFile: "Hilma af Klint - The Ten Largest No. 7 - Adulthood - 1907.jpg",
    categories: ["abstract", "modern"],
  },
  {
    id: "af-klint-ten-largest-2",
    title: "The Ten Largest, No. 2, Childhood",
    artist: "Hilma af Klint",
    year: "1907",
    museum: "Moderna Museet",
    commonsFile: "Hilma af Klint - The Ten Largest No. 2 - Childhood - 1907.jpg",
    categories: ["abstract", "modern"],
  },
  {
    id: "malevich-black-square",
    title: "Black Suprematic Square",
    artist: "Kazimir Malevich",
    year: "1915",
    museum: "Tretyakov Gallery",
    commonsFile:
      "Kazimir Malevich, 1915, Black Suprematic Square, oil on linen canvas, 79.5 x 79.5 cm, Tretyakov Gallery, Moscow.jpg",
    categories: ["abstract", "modern"],
  },
  {
    id: "mondrian-tableau-i",
    title: "Tableau I",
    artist: "Piet Mondrian",
    year: "1921",
    museum: "Kunstmuseum",
    commonsFile: "Piet mondrian, tableau I, 1921.jpg",
    categories: ["abstract", "modern"],
  },
  {
    id: "klee-senecio",
    title: "Senecio",
    artist: "Paul Klee",
    year: "1922",
    museum: "Kunstmuseum Basel",
    commonsFile:
      "Paul Klee, 1922, Senecio, oil on gauze, 40.3 × 37.4 cm, Kunstmuseum Basel.jpg",
    categories: ["abstract", "modern"],
  },
  {
    id: "klee-fish-magic",
    title: "Fish Magic",
    artist: "Paul Klee",
    year: "1925",
    museum: "Philadelphia Museum of Art",
    commonsFile: "Paul Klee, Swiss - Fish Magic - Google Art Project.jpg",
    categories: ["abstract", "modern"],
  },
  {
    id: "hokusai-great-wave",
    title: "Under the Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    year: "c. 1831",
    museum: "The Metropolitan Museum of Art",
    commonsFile: "The Great Wave off Kanagawa.jpg",
    categories: ["non-western"],
  },
  {
    id: "hokusai-red-fuji",
    title: "Fine Wind, Clear Morning (Red Fuji)",
    artist: "Katsushika Hokusai",
    year: "c. 1831",
    museum: "Los Angeles County Museum of Art",
    commonsFile:
      "Katsushika Hokusai - Fine Wind, Clear Morning (Gaifū kaisei) - Google Art Project.jpg",
    categories: ["non-western"],
  },
  {
    id: "hiroshige-shin-ohashi",
    title: "Sudden Shower over Shin-Ōhashi Bridge and Atake",
    artist: "Utagawa Hiroshige",
    year: "1857",
    museum: "Brooklyn Museum",
    commonsFile: "Hiroshige, Sudden shower over Shin-Ōhashi bridge and Atake, 1857.jpg",
    categories: ["non-western"],
  },
  {
    id: "persian-court-of-gayumars",
    title: "The Court of Gayumars",
    artist: "Sultan Muhammad",
    year: "c. 1522–25",
    museum: "Aga Khan Museum",
    commonsFile: "Court of Gayumars Persian miniature.jpg",
    categories: ["non-western"],
  },
  {
    id: "benin-plaque-warrior",
    title: "Plaque: Warrior and Attendants",
    artist: "Edo court of Benin",
    year: "16th–17th century",
    museum: "The Metropolitan Museum of Art",
    commonsFile: "WLA metmuseum Plaque Warrior and Attendants Edo Court of Benin.jpg",
    categories: ["non-western"],
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function pickArtwork(seed: string, categories?: ArtCategory[]): Artwork {
  const pool = categories?.length
    ? ARTWORKS.filter((a) => a.categories.some((c) => categories.includes(c)))
    : ARTWORKS;
  const list = pool.length ? pool : ARTWORKS;
  return list[hashString(seed) % list.length];
}

export function commonsImageUrl(artwork: Artwork, width = 1400): string {
  const path = encodeURIComponent(artwork.commonsFile.replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${path}?width=${width}`;
}
