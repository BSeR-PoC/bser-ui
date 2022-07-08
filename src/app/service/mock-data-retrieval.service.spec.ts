import { TestBed } from '@angular/core/testing';

import { MockDataRetrievalService } from './mock-data-retrieval.service';

describe('MockDataRetrievalService', () => {
  let service: MockDataRetrievalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDataRetrievalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
