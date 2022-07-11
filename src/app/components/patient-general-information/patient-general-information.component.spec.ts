import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientGeneralInformationComponent } from './patient-general-information.component';

describe('PatientGeneralInformationComponent', () => {
  let component: PatientGeneralInformationComponent;
  let fixture: ComponentFixture<PatientGeneralInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientGeneralInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientGeneralInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
