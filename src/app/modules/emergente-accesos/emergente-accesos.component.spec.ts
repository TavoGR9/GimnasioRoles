import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergenteAccesosComponent } from './emergente-accesos.component';

describe('EmergenteAccesosComponent', () => {
  let component: EmergenteAccesosComponent;
  let fixture: ComponentFixture<EmergenteAccesosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmergenteAccesosComponent]
    });
    fixture = TestBed.createComponent(EmergenteAccesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
