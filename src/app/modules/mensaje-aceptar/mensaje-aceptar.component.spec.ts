import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajeAceptarComponent } from './mensaje-aceptar.component';

describe('MensajeAceptarComponent', () => {
  let component: MensajeAceptarComponent;
  let fixture: ComponentFixture<MensajeAceptarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MensajeAceptarComponent]
    });
    fixture = TestBed.createComponent(MensajeAceptarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
