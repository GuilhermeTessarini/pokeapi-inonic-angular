import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DetailsPageComponent } from './details-page.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PokemonService } from '../../services/PokemonService/pokemon.service';
import { FavoritesService } from '../../services/FavoritesService/favorites.service';
import { ToastController } from '@ionic/angular';

describe('DetailsPageComponent', () => {
  let component: DetailsPageComponent;
  let fixture: ComponentFixture<DetailsPageComponent>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;
  let favoritesServiceSpy: jasmine.SpyObj<FavoritesService>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let activatedRouteStub: any;

  beforeEach(waitForAsync(() => {
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', ['getPokemonDetail']);
    favoritesServiceSpy = jasmine.createSpyObj('FavoritesService', ['isFavorite', 'toggleFavorite']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: () => '1',
        },
      },
    };

    pokemonServiceSpy.getPokemonDetail.and.returnValue(of({
      id: 1,
      name: 'bulbasaur',
      types: [{ type: { name: 'grass' } }],
      abilities: [],
      stats: [],
      moves: [],
      sprites: { other: { 'official-artwork': { front_default: '' } } },
      weight: 69,
      height: 7,
    }));
    favoritesServiceSpy.isFavorite.and.returnValue(false);

    TestBed.configureTestingModule({
      imports: [DetailsPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: PokemonService, useValue: pokemonServiceSpy },
        { provide: FavoritesService, useValue: favoritesServiceSpy },
        { provide: ToastController, useValue: toastControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pokemon details on init', () => {
    expect(component.pokemon).toBeTruthy();
    expect(component.pokemon.name).toBe('bulbasaur');
    expect(component.isLoading).toBeFalse();
  });

  it('should show error toast on API error', async () => {
    const toastSpyObj = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastSpyObj));
    pokemonServiceSpy.getPokemonDetail.and.returnValue(throwError(() => new Error('API Error')));

    fixture = TestBed.createComponent(DetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await fixture.whenStable();
    await Promise.resolve();

    expect(toastControllerSpy.create).toHaveBeenCalled();
  });

  it('should toggle favorite status', () => {
    component.pokemon = { id: 1 };
    favoritesServiceSpy.isFavorite.and.returnValue(true);
    component.toggleFavorite();
    expect(favoritesServiceSpy.toggleFavorite).toHaveBeenCalledWith(1);
    expect(component.isFavorite).toBeTrue();
  });
});
