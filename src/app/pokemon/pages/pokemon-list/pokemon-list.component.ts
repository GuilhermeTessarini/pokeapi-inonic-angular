import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { PokemonService } from '../../services/pokemon.service';
import { PokemonItem } from '../../models/pokemon.model';

import { IonicModule } from '@ionic/angular';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular/standalone';

import { getPokemonTypeColor } from '../../utils/pokemon-type-colors';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss'],
  imports: [CommonModule, IonicModule, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle],
})
export class PokemonListComponent implements OnInit {
  pokemons: PokemonItem[] = [];
  isLoading = false;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.fetchPokemons();
  }

  fetchPokemons(): void {
    this.isLoading = true;
    this.pokemonService.getPokemonList().subscribe({
      next: (response) => {
        const pokemons = response.results.map((pokemon) => {
          const id = this.extractIdFromUrl(pokemon.url);
          return {
            ...pokemon,
            id,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          };
        });

        forkJoin(
          pokemons.map((p) => this.pokemonService.getPokemonDetail(p.id!).pipe())
        ).subscribe((details: any[]) => {
          this.pokemons = pokemons.map((p, i) => ({
            ...p,
            types: details[i].types.map((t: any) => t.type.name),
          }));
          this.isLoading = false;
        });
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private extractIdFromUrl(url: string): number {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? +match[1] : 0;
  }

  getCardColor(types: string[] = []): string {
    return getPokemonTypeColor(types);
  }
}
