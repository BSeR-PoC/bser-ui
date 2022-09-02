import { Injectable } from '@angular/core';
import {forkJoin, map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ServiceProviderService} from "./service-provider.service";
import {Bundle, BundleEntry, BundleEntryRequest} from "@fhir-typescript/r4-core/dist/fhir/Bundle";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";
import {Organization} from "@fhir-typescript/r4-core/dist/fhir/Organization";
import {PractitionerRole} from "@fhir-typescript/r4-core/dist/fhir/PractitionerRole";
import {Endpoint} from "@fhir-typescript/r4-core/dist/fhir/Endpoint";
import {Coding} from "@fhir-typescript/r4-core/dist/fhir/Coding";
import {CodeableConcept} from "@fhir-typescript/r4-core/dist/fhir/CodeableConcept";
import {Meta} from "@fhir-typescript/r4-core/dist/fhir/Meta";
import {ContactPoint} from "@fhir-typescript/r4-core/dist/fhir/ContactPoint";
import {HumanName} from "@fhir-typescript/r4-core/dist/fhir/HumanName";
import {v4 as uuidv4} from 'uuid';
import {
  Address,
  FhirCode,
  HealthcareService,
  Identifier,
  Location,
  Reference,
  Resource
} from "@fhir-typescript/r4-core/dist/fhir";
import {environment} from "../../environments/environment";
import {FhirTerminologyConstants} from "../providers/fhir-terminology-constants";
import {DaysOfWeekCodes, DaysOfWeekCodeType} from "@fhir-typescript/r4-core/dist/fhirValueSets/DaysOfWeekCodes";
import {TransactionBundleHandlerService} from "./transaction-bundle-handler.service";

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderRegistrationService {

  constructor(private transactionBundleHandler: TransactionBundleHandlerService, private fhirConstants: FhirTerminologyConstants, private http: HttpClient, private serviceProviderService: ServiceProviderService) { }

  getServiceProviders(): Observable<any> {
    return this.serviceProviderService.getServiceProviders().pipe(
      map(searchResult =>{
          return this.serviceProviderService.getServiceProviders();
        }
      )
    );
  }

  createNewServiceProvider(formData: any): Observable<any> {
    let practitioner: Practitioner = undefined;
    let location: Location = undefined;
    let resourceList = []
    if (!(Object.values(formData.practitioner).every(value => value === null))) {
      practitioner = this.buildBserPractitionerResource(formData.practitioner); // Optional
      resourceList.push(practitioner)
    }

    let endpoint = this.buildEndpointResource(formData.endpoint); // Required
    resourceList.push(endpoint);

    let organization = this.buildBserOrganizationResource(formData.organization); // Required
    resourceList.push(organization);

    let healthcareService = this.buildHealthcareServiceResource(formData.services, organization); // Required
    resourceList.push(healthcareService);

    if (!(Object.values(formData.location).every(value => value === null))) {
      location = this.buildBserServiceDeliveryLocation(formData.location, organization); // Optional
      resourceList.push(location);
    }

    let practitionerRole = this.buildBserRecipientPractitionerRole(practitioner, organization, endpoint, healthcareService, location); // Required
    resourceList.push(practitionerRole);

    return this.transactionBundleHandler.sendTransactionBundle("POST", resourceList);
  }

  deleteServiceProvider(resources: any): Observable<any> {
    return this.transactionBundleHandler.sendTransactionBundle("DELETE", resources);
  }

  createBundleDeleteRequestEntries(resources: any): BundleEntry[] {
    let bundleEntries = []
    Object.entries(resources).forEach(entry => {
        if (!(entry[1] === undefined)) {
          console.log(entry[1])
          let resource:any = entry[1];
          let bundleEntry = new BundleEntry({
            //fullUrl: resource.resourceType + "/" + resource.id,
            //resource: resource.toJSON(),
            request: new BundleEntryRequest({
              method: "DELETE",
              url: resource.resourceType + "/" + resource.id,
            })
          });
          bundleEntries.push(bundleEntry);
        }
    });
    return bundleEntries;
  }

  buildBserRecipientPractitionerRole(practitioner, organization, endpoint, healthcareService, location): PractitionerRole {
    let profile = "http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-ReferralRecipientPractitionerRole";
    let bserPractitionerRole = new PractitionerRole({
      meta: new Meta({profile: [profile]}),
      id: uuidv4(),
      organization: Reference.fromResource(organization),
      healthcareService: [Reference.fromResource(healthcareService)],
      endpoint: [Reference.fromResource(endpoint)]
    });
    if (practitioner !== undefined) {
      bserPractitionerRole.practitioner = Reference.fromResource(practitioner);
    }
    if (location !== undefined) {
      bserPractitionerRole.location = [Reference.fromResource(location)];
    }
    return bserPractitionerRole;
  }

  buildBserPractitionerResource(practitionerDetails: any): Practitioner {
    let profile = "http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-Practitioner";
    // TODO: Rebuild this once validators in place. Practitioner should be all or nothing.
    let practitioner = new Practitioner({
      meta: new Meta({profile: [profile]}),
      id: uuidv4()
    });

    if (practitionerDetails.npi !== null) {
      let npiIdentifier = new Identifier({
        system: "http://hl7.org.fhir/sid/us-npi",
        value: practitionerDetails.npi
      });
      practitioner.identifier = [npiIdentifier];
    }
    if (practitionerDetails.phone !== null) {
      let phoneContactPoint = new ContactPoint({
        system: "phone",
        use: "work",
        value: practitionerDetails.phone
      });
      practitioner.telecom = [phoneContactPoint];
    }

    // TODO: May need to check for empty string.
    if (practitionerDetails.givenName !== null || practitionerDetails.familyName !== null) {
      let name = new HumanName()
      if (practitionerDetails.givenName !== null) {
        name.given = [practitionerDetails.givenName];
      }
      if (practitionerDetails.familyName !== null) {
        name.family = practitionerDetails.familyName;
      }
      practitioner.name = [name];
    }
    return practitioner;
  }

  buildEndpointResource(endpointDetails: any): Endpoint {
    return new Endpoint({
      id: uuidv4().toString(),
      status: "active",
      connectionType: new Coding({system: "http://terminology.hl7.org/CodeSystem/endpoint-connection-type", code: "hl7-fhir-msg"}),
      payloadType: [new CodeableConcept({
          text: "BSeR Referral Request Message"
        }
        )],
      address: endpointDetails.address
    })
  }

  buildBserOrganizationResource(organizationDetails: any): Organization {
    let typeCoding = new Coding({
      system: "http://terminology.hl7.org/CodeSystem/organization-type",
      code: "prov",
      display: "Healthcare Provider"
    });

    let phoneContactPoint = new ContactPoint({
      system: "phone",
      use: "work",
      value: organizationDetails.phone
    });

    return new Organization({
      meta: new Meta({
        profile: ["http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-Organization"]
      }),
      id: uuidv4(),
      active: true,
      type: [new CodeableConcept({coding: [typeCoding]})],
      name: organizationDetails.name,
      telecom: [phoneContactPoint]
    });
  }

  buildHealthcareServiceResource(serviceDetails: any, organization: Organization): HealthcareService {
    let daysOfWeekSelected: string[] = [];
    for (let i = 0; i < serviceDetails.days.length; i++){
      if (serviceDetails.days[i]) {
        daysOfWeekSelected.push(this.fhirConstants.DAYS_OF_WEEK[i].code);
      }
    }

    let serviceTypes: CodeableConcept[] = [];
    for (let i = 0; i < serviceDetails.serviceType.length; i++) {
      if (serviceDetails.serviceType[i]) {
        let typeCodeableConcept = new CodeableConcept({
          coding: [this.fhirConstants.SERVICE_TYPES[i]]
        });
        serviceTypes.push(typeCodeableConcept);
      }
    }

    let communication: CodeableConcept[] = [];
    for (let i = 0; i < serviceDetails.languages.length; i++) {
      if (serviceDetails.languages[i]) {
        let languageCodeableConcept = new CodeableConcept({
          coding: [this.fhirConstants.LANGUAGE[i]],
          text: this.fhirConstants.LANGUAGE[i].display
        });
        communication.push(languageCodeableConcept);
      }
    }

    return new HealthcareService({
      id: uuidv4(),
      providedBy: Reference.fromResource(organization),
      type: serviceTypes,
      communication: communication,
      availableTime: [
        {
          daysOfWeek: daysOfWeekSelected,
          availableStartTime: serviceDetails.startTime + ":00",
          availableEndTime: serviceDetails.endTime + ":00"
        }
      ]
    })
  }

  buildBserServiceDeliveryLocation(locationDetails: any, organization: Organization): Location {
    let profile = "http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-ServiceDeliveryLocation";

    let phoneContactPoint = new ContactPoint({
      system: "phone",
      use: "work",
      value: locationDetails.phone
    });

    let address = new Address({
      line: [locationDetails.street1],
      city: locationDetails.city,
      state: locationDetails.state,
      postalCode: locationDetails.zip
    });

    if (locationDetails.street2 !== undefined && locationDetails.street2 !== null) {
      address.line.push(locationDetails.street2); // Optional
    }

    return new Location({
      meta: new Meta({profile: [profile]}),
      id: uuidv4(),
      name: locationDetails.name,
      telecom: [phoneContactPoint],
      address: address,
      managingOrganization: Reference.fromResource(organization)
    });
  }
}
