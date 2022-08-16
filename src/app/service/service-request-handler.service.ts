import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ServiceRequest} from '@fhir-typescript/r4-core/dist/fhir/ServiceRequest';
import {BehaviorSubject, map} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Reference} from "@fhir-typescript/r4-core/dist/fhir/Reference";
import {PractitionerRole} from "@fhir-typescript/r4-core/dist/fhir/PractitionerRole";
import {v4 as uuidv4} from 'uuid';
import {FhirClientService} from "../fhir-client.service";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";
import {Parameters, ParametersParameter} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {CodeableConcept} from "@fhir-typescript/r4-core/dist/fhir/CodeableConcept";
import {Coding} from "@fhir-typescript/r4-core/dist/fhir/Coding";

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestHandlerService {

  // TODO: Why is only working as a BehaviorSubject and not just Subject?
  private currentSnapshot = new BehaviorSubject<any>(null);
  public currentSnapshot$ = this.currentSnapshot.asObservable();
  private currentParameters = new BehaviorSubject<any>(null);
  public currentParameters$ = this.currentParameters.asObservable();
  private lastSnapshot: ServiceRequest = null;
  private lastParameters: Parameters = null;

  private practitioner: Practitioner;

  constructor(private http: HttpClient, private fhirClient: FhirClientService) {}

  public deepCopy(object: any): any {
    // TODO: Can be replaced by structuredClone in Node 17.
    return JSON.parse(JSON.stringify(object));
  }

  public deepCompare(object1: any, object2): boolean {
    // Returns true if contents same.
    return JSON.stringify(object1) === JSON.stringify(object2);
  }

  // STEP 0
  // Resume or Create
  resumeServiceRequest() {
    //TODO: Implement
  }

  createNewServiceRequest() {
    //let code = createServiceRequestCoding();
    this.fhirClient.getPractitioner().subscribe({
      next: practitioner => {
        this.practitioner = Object.assign(new Practitioner(), practitioner);
        let parameters = new Parameters( {id: uuidv4()});
        let serviceRequest = new ServiceRequest({
          code: this.createServiceRequestCoding(),
          requester: Reference.fromResource(practitioner),
          status: "draft",
          intent: "order",
          authoredOn: new Date().toISOString(),
          supportingInfo: [Reference.fromResource(parameters)]
        });
        this.lastSnapshot = new ServiceRequest(this.deepCopy(serviceRequest));
        this.lastParameters = new Parameters(this.deepCopy(parameters));
        console.log(serviceRequest)
        console.log(this.lastSnapshot)
        this.currentSnapshot.next(serviceRequest);
        this.currentParameters.next(parameters);
        console.log("SERVICE REQUEST CREATED");
      }
    });
  }

  private createServiceRequestCoding(): CodeableConcept {
    let coding = new Coding({system: "http://snomed.info/sct", code: "3457005", display: "Patient referral (procedure)"})
    let codeableConcept = new CodeableConcept({coding: [coding], text: "Draft BSeR Referral"})
    return codeableConcept
  }

  // STEP 1 - Get Service Providers
  public getServiceProviders() {
    let profile = "http://hl7.org/fhir/us/bser/StructureDefinition/BSeR-ReferralRecipientPractitionerRole";
    let include = "&_include=PractitionerRole:practitioner&_include=PractitionerRole:organization"
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
        let serviceProvider = { "practitionerRole": practitionerRole.resource};
        if ("practitioner" in practitionerRole.resource) {
          serviceProvider["practitioner"] = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.practitioner.reference))).resource;
        }
        if ("organization" in practitionerRole.resource) {
          serviceProvider["organization"] = (results.entry.find(entry => entry.fullUrl.endsWith(practitionerRole.resource.organization.reference))).resource;
        }
        if ("location" in practitionerRole.resource) {
          // TODO: Implement Location
        }
        serviceProviderList.push(serviceProvider)
      }
    )
    return serviceProviderList
  }

  checkIfSnapshotStateChanged(currentSnapshot: ServiceRequest, currentParameters: Parameters): boolean {
    // Compare currentSnapshot to lastSnapshot.
    if (this.deepCompare(currentSnapshot, this.lastSnapshot) && this.deepCompare(currentParameters, this.lastParameters)) {
      console.log("Service Request Not Changed");
      return false;
    }
    else {
      console.log("Service Request Changed");
      return true;
    }
  }

  saveServiceRequest(currentSnapshot: ServiceRequest) {
    if (!("id" in currentSnapshot)) {
      let connectionUrl = environment.bserProviderServer + "ServiceRequest";
      this.lastSnapshot = this.deepCopy(currentSnapshot);
      return this.http.post(connectionUrl, currentSnapshot).pipe(
        map(result => {
          this.lastSnapshot = this.deepCopy(result);
          return result;
        }));
    }
    else {
      let connectionUrl = environment.bserProviderServer + "ServiceRequest/" + currentSnapshot.id;
      return this.http.put(connectionUrl, currentSnapshot).pipe(
        map(result => {
          this.lastSnapshot = this.deepCopy(result);
          return result;
        }));
    }
  }

  // First Screen User Input
  setRecipient(currentSnapshot: ServiceRequest, recipient: PractitionerRole) {
    let recipientTest = new PractitionerRole({id: uuidv4() })
    currentSnapshot.performer.length = 0;
    currentSnapshot.performer.push(Reference.fromResource(recipientTest));
  }

  // Second Screen User Input
  setServiceType(currentParameters: Parameters, serviceType: string) {
    // TODO: Check if Parameter exists -- get from Raven 1 code.
    // TODO: See how best to do an update using the Microsoft library.
    let parameter = new ParametersParameter({name: "test", valueCode: serviceType});
    currentParameters.parameter.push(parameter);
    this.currentParameters.next(currentParameters);
  }
  // TODO: Race, Ethnicity, Employment, Education

  // Third Screen User Input (Supporting Info)


  // TODO: Delete later, testing only.
  deleteTestData() {
    let connectionUrl = environment.bserProviderServer + "ServiceRequest";
    this.http.get(connectionUrl).toPromise().then((data: any) => {
      console.log(data);
      data.entry.forEach(resource => {
        let id = resource.resource.id;
        this.http.delete(connectionUrl + "/" + id).toPromise().then(result => console.log(result));
      });
    });
  }
}
