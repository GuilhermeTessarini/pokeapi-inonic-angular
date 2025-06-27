import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  const storageKey = 'favoritePokemons';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an empty array if no favorites are stored', () => {
    expect(service.getFavorites()).toEqual([]);
  });

  it('should add a favorite and persist it', () => {
    service.addFavorite(25);
    expect(service.getFavorites()).toContain(25);
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toContain(25);
  });

  it('should not add duplicate favorites', () => {
    service.addFavorite(1);
    service.addFavorite(1);
    expect(service.getFavorites()).toEqual([1]);
  });

  it('should remove a favorite', () => {
    service.addFavorite(7);
    service.removeFavorite(7);
    expect(service.getFavorites()).not.toContain(7);
  });

  it('should toggle favorite: add if not present', () => {
    service.toggleFavorite(10);
    expect(service.getFavorites()).toContain(10);
  });

  it('should toggle favorite: remove if present', () => {
    service.addFavorite(15);
    service.toggleFavorite(15);
    expect(service.getFavorites()).not.toContain(15);
  });

  it('should check if a pokemon is favorite', () => {
    service.addFavorite(99);
    expect(service.isFavorite(99)).toBeTrue();
    expect(service.isFavorite(100)).toBeFalse();
  });
});
