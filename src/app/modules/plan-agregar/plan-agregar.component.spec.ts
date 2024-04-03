import { ComponentFixture, TestBed } from '@angular/core/testing';

import { planAgregarComponent } from './membresias-agregar.component';

describe('MembresiasAgregarComponent', () => {
  let component: planAgregarComponent;
  let fixture: ComponentFixture<planAgregarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [planAgregarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(planAgregarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
