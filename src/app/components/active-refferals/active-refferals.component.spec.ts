import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveRefferalsComponent } from './active-refferals.component';

describe('ActiveRefferalsComponent', () => {
  let component: ActiveRefferalsComponent;
  let fixture: ComponentFixture<ActiveRefferalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveRefferalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveRefferalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
