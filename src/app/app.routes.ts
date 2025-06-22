import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pokemon/pages/pokemon-list/pokemon-list.component').then((m) => m.PokemonListComponent),
  },
  {
  path: 'pokemon/:id',
  loadComponent: () => import('./pokemon/pages/details-page/details-page.component').then(m => m.DetailsPageComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
