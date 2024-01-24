import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergenteCargarFotoComponent } from './emergente-cargar-foto.component';

describe('EmergenteCargarFotoComponent', () => {
  let component: EmergenteCargarFotoComponent;
  let fixture: ComponentFixture<EmergenteCargarFotoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmergenteCargarFotoComponent]
    });
    fixture = TestBed.createComponent(EmergenteCargarFotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
