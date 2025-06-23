import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private storageKey = 'favoritePokemons';

  getFavorites(): number[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  isFavorite(id: number): boolean {
    return this.getFavorites().includes(id);
  }

  addFavorite(id: number): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem(this.storageKey, JSON.stringify(favorites));
    }
  }

  removeFavorite(id: number): void {
    const favorites = this.getFavorites().filter(favId => favId !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(favorites));
  }

  toggleFavorite(id: number): void {
    this.isFavorite(id) ? this.removeFavorite(id) : this.addFavorite(id);
  }
}
