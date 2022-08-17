import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ServiceProviderService} from "./service-provider.service";

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderRegistrationService {

  constructor(private http: HttpClient, private serviceProviderService: ServiceProviderService) { }

  getServiceProviders(): Observable<any> {
    return this.serviceProviderService.getServiceProviders().pipe(
      map(searchResult =>{
          console.log("FETCHED SERVICE PROVIDERS");
          console.log(searchResult);
          return this.serviceProviderService.getServiceProviders();
        }
      )
    );
  }
}
