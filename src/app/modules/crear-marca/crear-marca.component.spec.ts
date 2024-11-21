import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearMarcaComponent } from './crear-marca.component';

describe('CrearMarcaComponent', () => {
  let component: CrearMarcaComponent;
  let fixture: ComponentFixture<CrearMarcaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrearMarcaComponent]
    });
    fixture = TestBed.createComponent(CrearMarcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
