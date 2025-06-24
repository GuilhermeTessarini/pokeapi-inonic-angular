import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: 'pokemon-list',
        loadComponent: () =>
          import('./pokemon/pages/pokemon-list/pokemon-list.component').then(
            (m) => m.PokemonListComponent
          ),
      },
      {
        path: 'details/:id',
        loadComponent: () =>
          import('./pokemon/pages/details-page/details-page.component').then(
            (m) => m.DetailsPageComponent
          ),
      },
      {
        path: '',
        redirectTo: 'pokemon-list',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/pokemon-list',
    pathMatch: 'full',
  },
];
