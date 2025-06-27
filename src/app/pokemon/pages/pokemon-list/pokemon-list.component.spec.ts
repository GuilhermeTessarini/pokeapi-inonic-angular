import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PokemonListComponent } from './pokemon-list.component';
import { PokemonService } from '../../services/PokemonService/pokemon.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

describe('PokemonListComponent', () => {
  let component: PokemonListComponent;
  let fixture: ComponentFixture<PokemonListComponent>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  beforeEach(waitForAsync(() => {
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', ['getPokemonList', 'getPokemonDetail']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    pokemonServiceSpy.getPokemonList.and.returnValue(of({
      results: [],
      count: 0,
      next: '',
      previous: ''
    }));

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), PokemonListComponent],
      providers: [
        { provide: PokemonService, useValue: pokemonServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show spinner when loading', () => {
    component.isLoading = true;
    component.pokemonList = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('ion-spinner')).toBeTruthy();
  });

  it('should call router.navigate when goToDetails is called', () => {
    component.goToDetails(25);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/details', 25]);
  });

  it('should show error toast on API error', async () => {
    const toastSpyObj = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastSpyObj));
    pokemonServiceSpy.getPokemonList.and.returnValue(throwError(() => new Error('API Error')));

    fixture = TestBed.createComponent(PokemonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await fixture.whenStable();
    await Promise.resolve();

    expect(toastControllerSpy.create).toHaveBeenCalled();
  });
});
