import type { TMDBMedia, TMDBSearchResponse, Hint, MediaType } from "@/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Genre mappings for hints
const MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Aventure",
  16: "Animation",
  35: "Comédie",
  80: "Crime",
  99: "Documentaire",
  18: "Drame",
  10751: "Famille",
  14: "Fantastique",
  36: "Histoire",
  27: "Horreur",
  10402: "Musique",
  9648: "Mystère",
  10749: "Romance",
  878: "Science-Fiction",
  10770: "Téléfilm",
  53: "Thriller",
  10752: "Guerre",
  37: "Western",
};

const TV_GENRES: Record<number, string> = {
  10759: "Action & Aventure",
  16: "Animation",
  35: "Comédie",
  80: "Crime",
  99: "Documentaire",
  18: "Drame",
  10751: "Famille",
  10762: "Enfants",
  9648: "Mystère",
  10763: "News",
  10764: "Réalité",
  10765: "Sci-Fi & Fantastique",
  10766: "Soap",
  10767: "Talk",
  10768: "Guerre & Politique",
  37: "Western",
};

export function getImageUrl(path: string | null, size: "w200" | "w300" | "w500" | "original" = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function getPopularMovies(page: number = 1): Promise<TMDBSearchResponse> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=fr-FR&page=${page}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export async function getPopularTVShows(page: number = 1): Promise<TMDBSearchResponse> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/tv/popular?api_key=${apiKey}&language=fr-FR&page=${page}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export async function getTopRatedMovies(page: number = 1): Promise<TMDBSearchResponse> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/top_rated?api_key=${apiKey}&language=fr-FR&page=${page}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export async function getTopRatedTVShows(page: number = 1): Promise<TMDBSearchResponse> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/tv/top_rated?api_key=${apiKey}&language=fr-FR&page=${page}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export async function getRandomMedia(count: number = 5): Promise<Array<TMDBMedia & { mediaType: MediaType }>> {
  const results: Array<TMDBMedia & { mediaType: MediaType }> = [];
  
  // Get random pages from different categories
  const randomPages = Array.from({ length: Math.ceil(count / 2) }, () => Math.floor(Math.random() * 10) + 1);
  
  const [popularMovies, popularTV, topMovies, topTV] = await Promise.all([
    getPopularMovies(randomPages[0] || 1),
    getPopularTVShows(randomPages[1] || 1),
    getTopRatedMovies(randomPages[2] || 1),
    getTopRatedTVShows(randomPages[3] || 1),
  ]);

  // Combine all results
  const allMedia: Array<TMDBMedia & { mediaType: MediaType }> = [
    ...popularMovies.results.map((m) => ({ ...m, mediaType: "movie" as MediaType })),
    ...popularTV.results.map((m) => ({ ...m, mediaType: "tv" as MediaType })),
    ...topMovies.results.map((m) => ({ ...m, mediaType: "movie" as MediaType })),
    ...topTV.results.map((m) => ({ ...m, mediaType: "tv" as MediaType })),
  ];

  // Filter out items without posters or titles
  const validMedia = allMedia.filter(
    (m) => m.poster_path && (m.title || m.name) && m.overview
  );

  // Shuffle and pick random items
  const shuffled = validMedia.sort(() => Math.random() - 0.5);
  
  // Avoid duplicates
  const seen = new Set<number>();
  for (const media of shuffled) {
    if (results.length >= count) break;
    if (!seen.has(media.id)) {
      seen.add(media.id);
      results.push(media);
    }
  }

  return results;
}

export function generateHints(media: TMDBMedia & { mediaType: MediaType }): Hint[] {
  const title = media.title || media.name || "";
  const year = media.release_date?.split("-")[0] || media.first_air_date?.split("-")[0] || "N/A";
  const genres = media.mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;
  const genreNames = media.genre_ids.map((id) => genres[id]).filter(Boolean).slice(0, 2);
  
  // Create a censored overview (first sentence, with some words hidden)
  const firstSentence = media.overview.split(".")[0] + ".";
  const censoredOverview = firstSentence.length > 100 
    ? firstSentence.slice(0, 100) + "..." 
    : firstSentence;

  const hints: Hint[] = [
    {
      type: "genre",
      value: genreNames.length > 0 ? genreNames.join(", ") : "Non classé",
      revealed: false,
    },
    {
      type: "year",
      value: year,
      revealed: false,
    },
    {
      type: "rating",
      value: `${media.vote_average.toFixed(1)}/10`,
      revealed: false,
    },
    {
      type: "overview",
      value: censoredOverview,
      revealed: false,
    },
    {
      type: "letter",
      value: `Commence par "${title.charAt(0).toUpperCase()}" (${title.length} lettres)`,
      revealed: false,
    },
  ];

  return hints;
}

export function getMediaTitle(media: TMDBMedia): string {
  return media.title || media.name || "Sans titre";
}

export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  // Exact match
  if (normalizedUser === normalizedCorrect) return true;

  // Check if the answer contains the correct title (for partial matches)
  if (normalizedCorrect.includes(normalizedUser) && normalizedUser.length >= 3) {
    return true;
  }

  // Check similarity (Levenshtein distance)
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
  const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
  const similarity = 1 - distance / maxLength;

  // Accept if similarity is above 80%
  return similarity >= 0.8;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
