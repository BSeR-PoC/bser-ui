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
import {Identifier, Reference, Resource} from "@fhir-typescript/r4-core/dist/fhir";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ServiceProviderRegistrationService {

  constructor(private http: HttpClient, private serviceProviderService: ServiceProviderService) { }

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
    if (!(Object.values(formData.practitioner).every(value => value === null))) {
      practitioner = this.buildBserPractitionerResource(formData.practitioner);
    }
    let endpoint = this.buildEndpointResource(formData.endpoint);
    let organization = this.buildBserOrganizationResource(formData.organization);
    let practitionerRole = this.buildBserRecipientPractitionerRole(practitioner, organization, endpoint);

    let transBundle = new Bundle({type: "transaction"});

    this.createBundlePostRequestEntries([practitionerRole, practitioner, organization, endpoint]).forEach(
      bundleEntry => transBundle.entry.push(bundleEntry)
    );
    return this.http.post(environment.bserProviderServer, transBundle.toJSON());
  }

  deleteServiceProvider(resources: any): Observable<any> {
    console.log(resources);
    // return new Observable<any>();
    // let observables = []
    // Object.entries()
    // const response = forkJoin([
    //   this.http.delete()
    //
    //   ]);
    let transBundle = new Bundle({type: "transaction"});
    this.createBundleDeleteRequestEntries(resources).forEach(
      bundleEntry => transBundle.entry.push(bundleEntry)
    );
    console.log(transBundle);
    return this.http.post(environment.bserProviderServer, transBundle.toJSON());
  }

  createBundlePostRequestEntries(resources: Resource[]): BundleEntry[] {
    let bundleEntries = []
    resources.forEach(resource => {
      let bundleEntry = new BundleEntry({
        fullUrl: resource.resourceType + "/" + resource.id,
        resource: resource.toJSON(),
        request: new BundleEntryRequest({
          method: "POST",
          url: resource.resourceType
        })
      });
      bundleEntries.push(bundleEntry);
    });
    return bundleEntries;
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

  buildBserRecipientPractitionerRole(practitioner, organization, endpoint): PractitionerRole {
    let profile = "http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-ReferralRecipientPractitionerRole";
    let bserPractitionerRole = new PractitionerRole({
      meta: new Meta({profile: [profile]}),
      id: uuidv4(),
      organization: Reference.fromResource(organization),
      endpoint: [Reference.fromResource(endpoint)]
    });
    if (practitioner !== undefined) {
      bserPractitionerRole.practitioner = Reference.fromResource(practitioner);
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

  buildEndpointResource(endpoint: string): Endpoint {
    return new Endpoint({
      id: uuidv4().toString(),
      status: "active",
      connectionType: new Coding({system: "http://terminology.hl7.org/CodeSystem/endpoint-connection-type", code: "hl7-fhir-msg"}),
      payloadType: [new CodeableConcept(
        {text: "BSeR Referral Message"
        })],
      address: endpoint
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
}
