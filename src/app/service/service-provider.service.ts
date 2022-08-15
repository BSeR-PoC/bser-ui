import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {

  constructor(private http: HttpClient) { }

  getServiceProviders(): Observable<any[]> {
    return this.http.get<any[]>('./assets/mock_data/service_providers.json');
  }
}
