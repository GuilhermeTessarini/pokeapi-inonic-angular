import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import {
  InfiniteScrollCustomEvent,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
} from '@ionic/angular/standalone';

import { PokemonService } from '../../services/pokemon.service';
import { PokemonItem } from '../../models/pokemon.model';
import { getPokemonTypeColor } from '../../utils/pokemon-type-colors';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
  ],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss'],
})
export class PokemonListComponent implements OnInit {
  pokemonList: PokemonItem[] = [];
  isLoading = false;
  isAllLoaded = false;

  private pageLimit = 20;
  private pageOffset = 0;

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadPokemonPage();
  }

  private loadPokemonPage(event?: InfiniteScrollCustomEvent): void {
    if (this.isAllLoaded) {
      event?.target.complete();
      return;
    }

    this.pokemonService
      .getPokemonList(this.pageLimit, this.pageOffset)
      .subscribe({
        next: (response) => {
          if (!response.next || response.results.length < this.pageLimit) {
            this.isAllLoaded = true;
          }

          const pokemonsPage = response.results.map((pokemon) => {
            const id = this.extractIdFromUrl(pokemon.url);
            return {
              ...pokemon,
              id,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          });

          forkJoin(
            pokemonsPage.map((pokemon) =>
              this.pokemonService.getPokemonDetail(pokemon.id!)
            )
          ).subscribe((details) => {
            const enrichedPokemons = pokemonsPage.map((pokemon, i) => ({
              ...pokemon,
              types: details[i].types.map((t: any) => t.type.name),
            }));

            this.pokemonList = [...this.pokemonList, ...enrichedPokemons];
            this.pageOffset += this.pageLimit;

            if (event) {
              event.target.complete();
            } else {
              this.isLoading = false;
            }
          });
        },
        error: () => {
          if (event) {
            event.target.complete();
          } else {
            this.isLoading = false;
          }
        },
      });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.loadPokemonPage(event);
  }

  trackByPokemonId(_: number, pokemon: PokemonItem) {
    return pokemon.id;
  }

  private extractIdFromUrl(url: string): number {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? +match[1] : 0;
  }

  getCardColor(types: string[] = []): string {
    return getPokemonTypeColor(types);
  }
}
