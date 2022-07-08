import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReferralComponent } from './create-referral.component';

describe('CreateReferralComponent', () => {
  let component: CreateReferralComponent;
  let fixture: ComponentFixture<CreateReferralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateReferralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
