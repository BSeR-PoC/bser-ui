import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAndSendComponent } from './review-and-send.component';

describe('ReviewAndSendComponent', () => {
  let component: ReviewAndSendComponent;
  let fixture: ComponentFixture<ReviewAndSendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewAndSendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewAndSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
