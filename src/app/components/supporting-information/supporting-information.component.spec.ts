import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportingInformationComponent } from './supporting-information.component';

describe('RequestSupportingInformationComponent', () => {
  let component: SupportingInformationComponent;
  let fixture: ComponentFixture<SupportingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupportingInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
