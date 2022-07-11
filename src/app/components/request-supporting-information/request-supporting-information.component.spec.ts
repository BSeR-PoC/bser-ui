import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSupportingInformationComponent } from './request-supporting-information.component';

describe('RequestSupportingInformationComponent', () => {
  let component: RequestSupportingInformationComponent;
  let fixture: ComponentFixture<RequestSupportingInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestSupportingInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestSupportingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
