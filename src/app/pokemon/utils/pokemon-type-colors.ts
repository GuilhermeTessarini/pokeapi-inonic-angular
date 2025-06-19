export const POKEMON_TYPE_COLORS: { [key: string]: string } = {
  fire: '#ffb385',
  water: '#8ecfff',
  grass: '#b9f6ca',
  electric: '#fff59d',
  bug: '#dcedc8',
  normal: '#f5f5f5',
  poison: '#e1bee7',
  ground: '#ffe082',
  fairy: '#f8bbd0',
  fighting: '#ffccbc',
  psychic: '#b388ff',
  rock: '#d7ccc8',
  ghost: '#b39ddb',
  ice: '#b3e5fc',
  dragon: '#b0bec5',
  dark: '#b0bec5',
  steel: '#cfd8dc',
  flying: '#b3e5fc'
};

export function getPokemonTypeColor(types: string[] = []): string {
  if (!types.length) return '#f5f5f5';
  return POKEMON_TYPE_COLORS[types[0]] || '#f5f5f5';
}