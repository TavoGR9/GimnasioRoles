import { ComponentFixture, TestBed } from '@angular/core/testing';

import { planComponent } from './membresias.component';

describe('MembresiasComponent', () => {
  let component: planComponent;
  let fixture: ComponentFixture<planComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [planComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(planComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
