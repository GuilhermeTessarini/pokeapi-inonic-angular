export interface PokemonItem {
  name: string;
  url: string;
  id?: number;
  image?: string;
  types?: string[];
}

export interface PokemonListResponse {
  count: number;
  next: string;
  previous: string;
  results: PokemonItem[];
}
