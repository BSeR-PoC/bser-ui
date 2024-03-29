import { Injectable } from '@angular/core';
import {map, Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {HumanName} from "@fhir-typescript/r4-core/dist/fhir/HumanName";
import {HealthcareService} from "@fhir-typescript/r4-core/dist/fhir";

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderService {

  constructor(private http: HttpClient) { }

  public getServiceProviders() {
    let profile = "http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-ReferralRecipientPractitionerRole";
    let include = "&_include=PractitionerRole:practitioner" +
                  "&_include=PractitionerRole:organization" +
                  "&_include=PractitionerRole:endpoint" +
                  "&_include=PractitionerRole:service" +
                  "&_include=PractitionerRole:location"
    let connectionUrl = environment.bserProviderServer + "PractitionerRole?_profile=" + profile + include;
    return this.http.get(connectionUrl).pipe(
      map(results => {
        const result = this.packageServiceProvidersIntoList(results);
        return result;
      })
    );
  }

  // Takes the Bundle with the includes and sorts them into a single object capturing all potential resources.
  private packageServiceProvidersIntoList(results: any): any {
    let serviceProviderList = []
    if(results.entry && results.entry.length) {
      let practitionerRoles = results.entry.filter(entry => entry.resource.resourceType === "PractitionerRole");
      practitionerRoles.forEach(practitionerRole => {
          // IF NEITHER PRACTITIONER NOR ORGANIZATION DISCARD AS INVALID
          if ("organization" in practitionerRole.resource) {
            let serviceProvider = {
              "practitionerRole": practitionerRole.resource,
              "practitioner": undefined,
              "organization": undefined,
              "location": undefined,
              "endpoint": undefined,
              "healthcareService": undefined
            };

            if ("practitioner" in practitionerRole.resource) {
              serviceProvider.practitioner = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.practitioner.reference)))?.resource;
            }
            if ("organization" in practitionerRole.resource) {
              serviceProvider.organization = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.organization.reference)))?.resource;
            }
            if ("location" in practitionerRole.resource) {
              serviceProvider.location = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.location[0].reference)))?.resource;
            }
            if ("endpoint" in practitionerRole.resource) {
              serviceProvider.endpoint = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.endpoint[0].reference)))?.resource;
            }
            if ("healthcareService" in practitionerRole.resource) {
              serviceProvider.healthcareService = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.healthcareService[0].reference)))?.resource;
            }
            //console.log(serviceProvider)
            let serviceProviderObj = this.createServiceProviderObj(serviceProvider)
            serviceProviderList.push(serviceProviderObj);
          //  console.log(serviceProviderObj);
          } else {
            console.log("Invalid PractitionerRole with id " + practitionerRole.resource.id + ". Requires Organization.")
          }

        }
      )
    }
    return serviceProviderList;
  }

  private createServiceProviderObj(serviceProvider: any) {
    //TODO: Add more complex name and telecom handling.
    return {
      "serviceProviderId": serviceProvider.practitionerRole.id,
      "practitioner": {
        "givenName": serviceProvider.practitioner?.name?.[0]?.given?.[0] || null,
        "familyName": serviceProvider.practitioner?.name?.[0]?.family || null,
        "phone": serviceProvider.practitioner?.telecom?.[0]?.value || null,
        "npi": serviceProvider.practitioner?.identifier?.[0]?.value || null
      },
      "organization": {
        "name": serviceProvider.organization.name,
        "phone": serviceProvider.organization?.telecom?.[0]?.value || null
      },
      "services": {
        "serviceType": this.getServiceTypes(serviceProvider.healthcareService) || null,
        "daysOfWeek": serviceProvider.healthcareService?.availableTime?.[0]?.daysOfWeek || null,
        "startTime": serviceProvider.healthcareService?.availableTime?.[0]?.availableStartTime || null,
        "endTime": serviceProvider.healthcareService?.availableTime?.[0]?.availableEndTime || null,
        "languages": this.getLanguagesFromServiceProvider(serviceProvider)
      },
      "location": {
          "line": serviceProvider.location?.address?.line?.[0] || null,
          "city": serviceProvider.location?.address?.city || null,
          "postalCode": serviceProvider.location?.address?.postalCode || null,
          "state": serviceProvider.location?.address?.state || null
      },
      "endpoint": serviceProvider.endpoint?.address,
      "selected": false,
      "resources": serviceProvider
    }
  }

  private getServiceTypes(healthcareService: HealthcareService){
    const serviceTypes = [];
    healthcareService?.type?.forEach(serviceType => {
      serviceTypes.push(serviceType.coding?.[0]?.code)
    });
    return serviceTypes;
  }

  // TODO: Add "use" handling.
  private getFullName(humanName: HumanName[]){

    return "Test Name"
  }

  private getLanguagesFromServiceProvider(serviceProvider: any): string[] {
    if(!serviceProvider?.healthcareService?.communication?.length){
      return null;
    }
    else {
      return serviceProvider.healthcareService.communication
        .map(entry => entry?.text)
        .filter(entry => !!entry)
    }
  }
}
