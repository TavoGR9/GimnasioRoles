import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarProductoLineaComponent } from './editar-producto.component';

describe('EditarProductoLineaComponent', () => {
  let component: EditarProductoLineaComponent;
  let fixture: ComponentFixture<EditarProductoLineaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditarProductoLineaComponent]
    });
    fixture = TestBed.createComponent(EditarProductoLineaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
