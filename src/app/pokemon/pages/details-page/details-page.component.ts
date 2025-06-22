import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner, IonButton, IonIcon, IonCardContent } from '@ionic/angular/standalone';
import { PokemonService } from '../../services/pokemon.service';
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

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPokemonDetails(id);
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
      }
    });
  }

  getTypeColor(type: string): string {
    return getPokemonTypeColor([type]);
  }
}
