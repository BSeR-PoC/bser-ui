import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MockDataRetrievalService {

  constructor(private http: HttpClient) { }

  getActiveReferrals(): Observable<any[]> {
    return this.http.get<any[]>('./assets/mock_data/active_referrals.json');
  }
}
