import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaProductoLineaComponent } from './lista-producto.component';

describe('ListaProductoLineaComponent', () => {
  let component: ListaProductoLineaComponent;
  let fixture: ComponentFixture<ListaProductoLineaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaProductoLineaComponent]
    });
    fixture = TestBed.createComponent(ListaProductoLineaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
