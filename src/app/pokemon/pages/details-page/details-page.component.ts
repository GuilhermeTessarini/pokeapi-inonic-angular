import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';

import { IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner, IonButton, IonIcon, IonCardContent } from '@ionic/angular/standalone';

import { PokemonService } from '../../services/PokemonService/pokemon.service';
import { FavoritesService } from '../../services/FavoritesService/favorites.service';
import { getPokemonTypeColor } from '../../utils/pokemon-type-colors';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonSpinner,
    IonButton,
    IonIcon,
    IonCardContent,
  ],
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss'],
})
export class DetailsPageComponent implements OnInit {
  pokemon: any = null;
  isLoading = true;
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService,
    private favoritesService: FavoritesService,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPokemonDetails(id);
      this.isFavorite = this.favoritesService.isFavorite(id);
    }
  }
  
  private loadPokemonDetails(id: number): void {
    this.isLoading = true;
    this.pokemonService.getPokemonDetail(id).subscribe({
      next: (data) => {
        this.pokemon = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showErrorToast('Erro ao carregar detalhes do Pokémon.');
      }
    });
  }

  getTypeColor(type: string): string {
    return getPokemonTypeColor([type]);
  }

  toggleFavorite(): void {
    if (!this.pokemon) return;
    this.favoritesService.toggleFavorite(this.pokemon.id);
    this.isFavorite = this.favoritesService.isFavorite(this.pokemon.id);
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
