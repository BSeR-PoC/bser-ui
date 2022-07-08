import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveReferralsComponent } from './active-refferals.component';

describe('ActiveRefferalsComponent', () => {
  let component: ActiveReferralsComponent;
  let fixture: ComponentFixture<ActiveReferralsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveReferralsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
