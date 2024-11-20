import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarProductoMembresiaComponent } from './agregar-producto-membresia.component';

describe('AgregarProductoMembresiaComponent', () => {
  let component: AgregarProductoMembresiaComponent;
  let fixture: ComponentFixture<AgregarProductoMembresiaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgregarProductoMembresiaComponent]
    });
    fixture = TestBed.createComponent(AgregarProductoMembresiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
