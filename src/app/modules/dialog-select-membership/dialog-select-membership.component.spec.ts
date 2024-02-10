import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSelectMembershipComponent } from './dialog-select-membership.component';

describe('DialogSelectMembershipComponent', () => {
  let component: DialogSelectMembershipComponent;
  let fixture: ComponentFixture<DialogSelectMembershipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogSelectMembershipComponent]
    });
    fixture = TestBed.createComponent(DialogSelectMembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
