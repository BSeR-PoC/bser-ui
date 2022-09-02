import { TestBed } from '@angular/core/testing';

import { ParameterHandlerService } from './parameter-handler.service';

describe('ParameterHandlerService', () => {
  let service: ParameterHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParameterHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
