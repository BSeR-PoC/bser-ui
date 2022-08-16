import { TestBed } from '@angular/core/testing';

import { ServiceRequestHandlerService } from './service-request-handler.service';

describe('ServiceRequestHandlerService', () => {
  let service: ServiceRequestHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceRequestHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
