import { TestBed } from '@angular/core/testing';

import { FhirClientService } from './fhir-client.service';

describe('FhirClientService', () => {
  let service: FhirClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FhirClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
