import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {

  constructor(private http: HttpClient) { }

  private selectedServiceProvider = new Subject<any>();

  public setSelectedServiceProvider(serviceProvider){
    this.selectedServiceProvider.next(serviceProvider);
  }

  public getSelectedServiceProvider(){
    return this.selectedServiceProvider.asObservable();
  }

  getServiceProviders(): Observable<any[]> {
    return this.http.get<any[]>('./assets/mock_data/service_providers.json');
  }
}
