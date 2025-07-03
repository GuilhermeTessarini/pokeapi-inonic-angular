import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subject, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import {
  InfiniteScrollCustomEvent,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { IonSearchbar } from '@ionic/angular/standalone';

import { PokemonService } from '../../services/PokemonService/pokemon.service';
import { PokemonItem } from '../../models/pokemon.model';
import { getPokemonTypeColor } from '../../utils/pokemon-type-colors';
import { extractIdFromUrl } from '../../utils/pokemon-utils';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSearchbar,
    IonContent,
    IonCard,
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
  filteredPokemonList: PokemonItem[] = [];
  searchTerm: string = '';
  isLoading = false;
  isAllLoaded = false;

  allPokemonNames: string[] = [];
  suggestions: string[] = [];

  private pageLimit = 40;
  private pageOffset = 0;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadPokemonPage();

    this.pokemonService.getAllPokemonNames().subscribe((names) => {
      this.allPokemonNames = names.map((n) => n.name);
    });

    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private setupSearch() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          const trimmed = term.trim().toLowerCase();
          if (!trimmed) {
            this.filterPokemonList();
            return of(this.filteredPokemonList);
          }
          if (this.allPokemonNames.includes(trimmed)) {
            return this.pokemonService.getPokemonDetailByName(trimmed).pipe(
              switchMap((detail) => {
                if (detail) {
                  const enriched = this.enrichPokemonDetail(detail);
                  return of([enriched]);
                }
                return of([]);
              })
            );
          } else {
            const local = this.pokemonList.filter((p) =>
              p.name.toLowerCase().includes(trimmed)
            );
            return of(local);
          }
        })
      )
      .subscribe((filtered) => {
        if (filtered.length === 1) {
          const enriched = this.enrichPokemonDetail(filtered[0]);
          if (!this.pokemonList.some((p) => p.id === enriched.id)) {
            this.pokemonList.push(enriched);
            this.pokemonList.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
          }
          this.filteredPokemonList = [enriched];
        } else {
          this.filteredPokemonList = filtered;
        }
      });
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
            const id = extractIdFromUrl(pokemon.url);
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
            this.filterPokemonList();
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
          this.showErrorToast('Erro ao carregar a lista de Pokémons.');
        },
      });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.loadPokemonPage(event);
  }

  getCardColor(types: string[] = []): string {
    return getPokemonTypeColor(types);
  }

  goToDetails(id?: number) {
    if (typeof id === 'number') {
      this.router.navigate(['/tabs/details', id]);
    }
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
    });
    toast.present();
  }

  onSearch(event: Event) {
    const term = this.searchTerm.trim().toLowerCase();
    this.suggestions = [];
    if (term.length > 1) {
      this.suggestions = this.allPokemonNames
        .filter((name) => name.includes(term))
        .slice(0, 10);
    }
    this.searchSubject.next(this.searchTerm);
  }

  selectSuggestion(name: string) {
    this.searchTerm = name;
    this.suggestions = [];
    setTimeout(() => this.searchSubject.next(name));
  }

  private filterPokemonList() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredPokemonList = this.pokemonList;
    } else {
      this.filteredPokemonList = this.pokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(term)
      );
    }
  }

  private enrichPokemonDetail(detail: any): PokemonItem {
    return {
      ...detail,
      id: detail.id,
      name: detail.name,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`,
      types: Array.isArray(detail.types)
        ? detail.types.map((t: any) =>
            typeof t === 'string' ? t : t.type?.name ?? ''
          )
        : [],
    };
  }
}
