import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelecomComponent } from './telecom.component';

describe('TelecomComponent', () => {
  let component: TelecomComponent;
  let fixture: ComponentFixture<TelecomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TelecomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelecomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
