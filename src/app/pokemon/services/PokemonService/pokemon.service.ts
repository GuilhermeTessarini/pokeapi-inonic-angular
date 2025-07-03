import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PokemonListResponse } from '../../models/pokemon.model';
import { map } from 'rxjs/operators';

interface PokemonNameListResponse {
  results: { name: string; url: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemonList(limit = 40, offset = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
  }

  getPokemonDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pokemon/${id}`);
  }

  getPokemonDetailByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pokemon/${name}`);
  }

  getAllPokemonNames(): Observable<{ name: string, url: string }[]> {
    return this.http.get<PokemonNameListResponse>(`${this.baseUrl}/pokemon?limit=2000`).pipe(
      map(res => res.results)
    );
  }
}
