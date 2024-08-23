import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestablecerContraComponent } from './restablecer-contra.component';

describe('RestablecerContraComponent', () => {
  let component: RestablecerContraComponent;
  let fixture: ComponentFixture<RestablecerContraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RestablecerContraComponent]
    });
    fixture = TestBed.createComponent(RestablecerContraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
