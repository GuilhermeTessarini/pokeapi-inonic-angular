import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { PokemonService } from './pokemon.service';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PokemonService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PokemonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch pokemon list with default params', () => {
    const mockResponse = { results: [], count: 0, next: '', previous: '' };
    service.getPokemonList().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch pokemon list with custom params', () => {
    const mockResponse = { results: [], count: 0, next: '', previous: '' };
    service.getPokemonList(10, 30).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=10&offset=30');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch pokemon detail by id', () => {
    const mockDetail = { id: 1, name: 'bulbasaur' };
    service.getPokemonDetail(1).subscribe((res) => {
      expect(res).toEqual(mockDetail);
    });

    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockDetail);
  });
});
