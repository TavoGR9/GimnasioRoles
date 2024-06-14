import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoMemComponent } from './pago-mem.component';

describe('PagoMemComponent', () => {
  let component: PagoMemComponent;
  let fixture: ComponentFixture<PagoMemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PagoMemComponent]
    });
    fixture = TestBed.createComponent(PagoMemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
