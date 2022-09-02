import { TestBed } from '@angular/core/testing';

import { TransactionBundleHandlerService } from './transaction-bundle-handler.service';

describe('TransactionBundleHandlerService', () => {
  let service: TransactionBundleHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionBundleHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
