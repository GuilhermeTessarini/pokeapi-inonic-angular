import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FavoritesPageComponent } from './favorites-page.component';
import { FavoritesService } from '../../services/FavoritesService/favorites.service';
import { PokemonService } from '../../services/PokemonService/pokemon.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('FavoritesPageComponent', () => {
  let component: FavoritesPageComponent;
  let fixture: ComponentFixture<FavoritesPageComponent>;
  let favoritesServiceSpy: jasmine.SpyObj<FavoritesService>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    favoritesServiceSpy = jasmine.createSpyObj('FavoritesService', ['getFavorites']);
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', ['getPokemonDetail']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FavoritesPageComponent],
      providers: [
        { provide: FavoritesService, useValue: favoritesServiceSpy },
        { provide: PokemonService, useValue: pokemonServiceSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  }));

  it('should create', () => {
    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load and display favorite pokemons', async () => {
    favoritesServiceSpy.getFavorites.and.returnValue([1, 2]);
    pokemonServiceSpy.getPokemonDetail.and.callFake((id: number) =>
      of({ id, name: `poke${id}`, types: [{ type: { name: 'grass' } }] })
    );
    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;
    component.loadFavorites();
    await fixture.whenStable();
    expect(component.favoritePokemons.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should show message when no favorites', () => {
    favoritesServiceSpy.getFavorites.and.returnValue([]);
    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;
    component.loadFavorites();
    expect(component.favoritePokemons.length).toBe(0);
    expect(component.isLoading).toBeFalse();
  });

  it('should navigate to details when goToDetails is called', () => {
    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;
    component.goToDetails(10);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/details', 10]);
  });

  it('should show error toast on API error', async () => {
    const toastSpyObj = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastSpyObj));
    favoritesServiceSpy.getFavorites.and.returnValue([1]);
    pokemonServiceSpy.getPokemonDetail.and.returnValue(throwError(() => new Error('API Error')));

    fixture = TestBed.createComponent(FavoritesPageComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
    await Promise.resolve();

    expect(toastControllerSpy.create).toHaveBeenCalled();
    expect(toastSpyObj.present).toHaveBeenCalled();
  });
});
