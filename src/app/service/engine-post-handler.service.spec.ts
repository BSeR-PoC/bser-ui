import { TestBed } from '@angular/core/testing';

import { EnginePostHandlerService } from './engine-post-handler.service';

describe('EnginePostHandlerService', () => {
  let service: EnginePostHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnginePostHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
