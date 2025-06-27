import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
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
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { FavoritesService } from '../../services/FavoritesService/favorites.service';
import { PokemonService } from '../../services/PokemonService/pokemon.service';
import { getPokemonTypeColor } from '../../utils/pokemon-type-colors';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-favorites-page',
  templateUrl: './favorites-page.component.html',
  styleUrls: ['./favorites-page.component.scss'],
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
    IonIcon,
  ],
})
export class FavoritesPageComponent implements OnInit {
  favoritePokemons: any[] = [];
  isLoading = false;

  constructor(
    private favoritesService: FavoritesService,
    private pokemonService: PokemonService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ heart, heartOutline });
  }

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading = true;
    const ids = this.favoritesService.getFavorites();
    this.favoritePokemons = [];
    if (ids.length === 0) {
      this.isLoading = false;
      return;
    }

    const detailObservables = ids.map((id) =>
      this.pokemonService.getPokemonDetail(id)
    );

    forkJoin(detailObservables).subscribe({
      next: (pokemons) => {
        this.favoritePokemons = pokemons
          .map((pokemon) => ({
            ...pokemon,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
            types: pokemon.types?.map((t: any) => t.type.name) ?? [],
          }))
          .sort((a, b) => a.id - b.id);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        void this.showErrorToast(
          'Erro ao carregar os favoritos. Tente novamente.'
        );
      },
    });
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
}
