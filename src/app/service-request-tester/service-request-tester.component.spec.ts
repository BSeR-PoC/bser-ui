import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRequestTesterComponent } from './service-request-tester.component';

describe('ServiceRequestTesterComponent', () => {
  let component: ServiceRequestTesterComponent;
  let fixture: ComponentFixture<ServiceRequestTesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceRequestTesterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceRequestTesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
