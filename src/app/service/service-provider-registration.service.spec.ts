import { TestBed } from '@angular/core/testing';

import { ServiceProviderRegistrationService } from './service-provider-registration.service';

describe('ServiceProviderResgistrationService', () => {
  let service: ServiceProviderRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceProviderRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
