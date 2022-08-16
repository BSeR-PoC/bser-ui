import { Injectable } from '@angular/core';
import {map, Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

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

  // getServiceProviders(): Observable<any[]> {
  //   return this.http.get<any[]>('./assets/mock_data/service_providers.json');
  // }

  public getServiceProviders() {
    let profile = "http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-ReferralRecipientPractitionerRole";
    let include = "&_include=PractitionerRole:practitioner&_include=PractitionerRole:organization" // TODO: ADD HEALTHCARE SERVICE INCLUDE
    let connectionUrl = environment.bserProviderServer + "PractitionerRole?_profile=" + profile + include;
    return this.http.get(connectionUrl).pipe(
      map(results => {
        return this.packageServiceProvidersIntoList(results);
      })
    );
  }

  // Takes the Bundle with the includes and sorts them into a single object capturing all 4 potential resources.
  private packageServiceProvidersIntoList(results: any): any {
    let serviceProviderList = []
    let practitionerRoles = results.entry.filter(entry => entry.resource.resourceType === "PractitionerRole");
    practitionerRoles.forEach(practitionerRole => {
        let serviceProvider = { "practitionerRole": practitionerRole.resource, "practitioner": undefined, "organization": undefined, "location": undefined};

        if ("practitioner" in practitionerRole.resource) {
          serviceProvider.practitioner = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.practitioner.reference))).resource;
        }
        if ("organization" in practitionerRole.resource) {
          serviceProvider.organization = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.organization.reference))).resource;
        }
        if ("location" in practitionerRole.resource) {
          // TODO: Implement Location
        }
        // IF NEITHER PRACTITIONER NOR ORGANIZATION DO NOT ADD TO LIST

        // TODO: Switch the data model to the real version
        let serviceProviderObj =   {
          "serviceProviderId": serviceProvider.practitionerRole.id,
          "name" : serviceProvider.organization?.name,
          "description": "Place holder description",
          "selected": false
        }
        serviceProviderList.push(serviceProviderObj)
      }
    )
    return serviceProviderList
  }
}
