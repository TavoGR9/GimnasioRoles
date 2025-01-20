import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearRolComponent } from './crear-rol.component';

describe('CrearRolComponent', () => {
  let component: CrearRolComponent;
  let fixture: ComponentFixture<CrearRolComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrearRolComponent]
    });
    fixture = TestBed.createComponent(CrearRolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
