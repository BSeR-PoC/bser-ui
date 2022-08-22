import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralManagerComponent } from './create-referral.component';

describe('CreateReferralComponent', () => {
  let component: ReferralManagerComponent;
  let fixture: ComponentFixture<ReferralManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferralManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
