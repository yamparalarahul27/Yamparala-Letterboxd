import animeRaw from "./watchlist/anime.json";
import moviesRaw from "./watchlist/movies.json";
import seriesRaw from "./watchlist/series.json";

export type WatchCategory = "anime" | "movie" | "series";
export type WatchStatus = "Watching" | "Completed" | "Planning" | "Dropped";

interface BaseWatchItem {
  id: string;
  title: string;
  titleEnglish: string | null;
  year: number | null;
  genres: string[];
  synopsis: string;
  image: string | null;
  source: string | null;
  status: WatchStatus;
  rating: number | null;
  favorite: boolean;
  notes: string;
}

export interface AnimeItem extends BaseWatchItem {
  category: "anime";
  episodes: number | null;
  studios: string[];
}

export interface MovieItem extends BaseWatchItem {
  category: "movie";
  runtime: number | null;
  director: string | null;
}

export interface SeriesItem extends BaseWatchItem {
  category: "series";
  seasons: number | null;
  episodes: number | null;
}

export type WatchItem = AnimeItem | MovieItem | SeriesItem;

const animeRows = (animeRaw.anime as Omit<AnimeItem, "category">[]).map(
  (a): AnimeItem => ({ ...a, category: "anime" })
);
const movieRows = (moviesRaw.movies as Omit<MovieItem, "category">[]).map(
  (m): MovieItem => ({ ...m, category: "movie" })
);
const seriesRows = (seriesRaw.series as Omit<SeriesItem, "category">[]).map(
  (s): SeriesItem => ({ ...s, category: "series" })
);

export const ANIME: AnimeItem[] = animeRows;
export const MOVIES: MovieItem[] = movieRows;
export const SERIES_WATCH: SeriesItem[] = seriesRows;

export const WATCHLIST: WatchItem[] = [...animeRows, ...movieRows, ...seriesRows];

export const WATCH_CATEGORIES: WatchCategory[] = ["anime", "movie", "series"];

const CATEGORY_LABEL: Record<WatchCategory, string> = {
  anime: "Anime",
  movie: "Movie",
  series: "Series",
};

export function watchCategoryLabel(c: WatchCategory): string {
  return CATEGORY_LABEL[c];
}

const itemsByCategory: Record<WatchCategory, WatchItem[]> = {
  anime: animeRows,
  movie: movieRows,
  series: seriesRows,
};

export function getWatchItemsByCategory(c: WatchCategory): WatchItem[] {
  return itemsByCategory[c];
}

export function getWatchItem(
  category: WatchCategory,
  id: string
): WatchItem | undefined {
  return itemsByCategory[category].find((i) => i.id === id);
}
