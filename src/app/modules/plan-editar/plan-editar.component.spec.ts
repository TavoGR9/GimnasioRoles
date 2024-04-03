import { ComponentFixture, TestBed } from '@angular/core/testing';

import { planEditarComponent } from './plan-editar.component';

describe('planEditarComponent', () => {
  let component: planEditarComponent;
  let fixture: ComponentFixture<planEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [planEditarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(planEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
