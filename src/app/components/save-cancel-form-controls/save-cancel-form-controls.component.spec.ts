import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveCancelFormControlsComponent } from './save-cancel-form-controls.component';

describe('SaveCancelFormControlsComponent', () => {
  let component: SaveCancelFormControlsComponent;
  let fixture: ComponentFixture<SaveCancelFormControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveCancelFormControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveCancelFormControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
