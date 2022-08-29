import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ServiceRequest} from '@fhir-typescript/r4-core/dist/fhir/ServiceRequest';
import {BehaviorSubject, forkJoin, map, Observable, switchMap} from 'rxjs';
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

  // STEP 0

  getDraftServiceRequests() {
    // TODO: Implement
    // Function for the front page to pull the list of Drafts.

  }

  // Resume or Create
  resumeServiceRequest(serviceRequest: ServiceRequest) {
    // TODO: Implement
    // Front page can pass ID on load.
  }

  createNewServiceRequest(){

    const client$ = this.fhirClient.getClient();
    const practitioner$ = this.fhirClient.getPractitioner();
    const patient$ = this.fhirClient.getPatient()

    forkJoin([client$, practitioner$, patient$]).subscribe(
      results => {
        const client = results[0];
        const practitioner = results[1];
        const patient = results[2];

        const smartServerUrl = client.getState("serverUrl");

        //TODO: delete the codeable concept code, it should come from the UI when the user selects the Recipient
        let coding = new Coding({code: "diabetes-prevention", display : "Diabetes Prevention"});
        let codeableConcept = new CodeableConcept({coding: [coding], text: "Diabetes Prevention"});
        console.log(codeableConcept);

        this.practitioner = Object.assign(new Practitioner(), practitioner);
        let parameters = new Parameters( {id: uuidv4()});
        let serviceRequest = new ServiceRequest({
          code: this.createServiceRequestCoding(),
          requester: Reference.fromResource(practitioner, smartServerUrl),
         // requester: Reference.fromResource(practitioner),
          status: "draft",
          intent: "order",
          authoredOn: new Date().toISOString(),
          //supportingInfo: [Reference.fromResource(parameters, environment.bserProviderServer)],
          supportingInfo: [Reference.fromResource(parameters)],
          subject: Reference.fromResource(patient, smartServerUrl),
          orderDetail: [new CodeableConcept(codeableConcept)]
          //subject: Reference.fromResource(patient),
        });
        this.lastSnapshot = new ServiceRequest(this.deepCopy(serviceRequest));
        this.lastParameters = new Parameters(this.deepCopy(parameters));
        console.log(serviceRequest)
        console.log(this.lastSnapshot)
        this.currentSnapshot.next(serviceRequest);
        this.currentParameters.next(parameters);
        console.log("SERVICE REQUEST CREATED");
      }
    )
  }

  private createServiceRequestCoding(): CodeableConcept {
    let coding = new Coding({system: "http://snomed.info/sct", code: "3457005", display: "Patient referral (procedure)"})
    let codeableConcept = new CodeableConcept({coding: [coding], text: "Draft BSeR Referral"})
    return codeableConcept
  }

  // STEP 1 - Get Service Providers
  // In the Service-Provider Service

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
    // const orderDetail =  [{
    //   coding:  {
    //     code: "diabetes-prevention",
    //     display: "Diabetes Prevention"
    //   } ,
    //   text: "Diabetes Prevention"
    // }];

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
  setRecipient(currentSnapshot: ServiceRequest, recipient: any) {
    //TODO refactor the code for testing
    let recipientTest = null;
    if(recipient?.resources?.practitionerRole){
      recipientTest = new PractitionerRole(recipient.resources.practitionerRole);
    }
    else {
      recipientTest = new PractitionerRole({id: uuidv4() }); //only for testing
    }

    currentSnapshot.performer.length = 0;
    //currentSnapshot.performer.push(Reference.fromResource(recipientTest,  environment.bserProviderServer));
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

  setServiceTypePlamen(currentSnapshot: ServiceRequest, serviceType: CodeableConcept) {
    // TODO: Check if Parameter exists -- get from Raven 1 code.
    // TODO: See how best to do an update using the Microsoft library.
    // let parameter = new ParametersParameter({name: "test", valueCode: serviceType});
    // currentParameters.parameter.push(parameter);
    // this.currentParameters.next(currentParameters);
    currentSnapshot.orderDetail.length = 0;
    currentSnapshot.orderDetail.push(serviceType);
  }


  // TODO: Race, Ethnicity, Employment, Education

  // Third Screen User Input (Supporting Info)


  // Helper Functions
  public deepCopy(object: any): any {
    // TODO: Can be replaced by structuredClone in Node 17.
    return JSON.parse(JSON.stringify(object));
  }

  public deepCompare(object1: any, object2): boolean {
    // Returns true if contents same.
    return JSON.stringify(object1) === JSON.stringify(object2);
  }


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

  getServiceRequestList() : Observable<any> {

    const patient$ = this.fhirClient.getPatient();
    const client$ = this.fhirClient.getClient();

    return forkJoin([patient$, client$])
      .pipe(
        switchMap(results => {
            const patientId = results[0].id;
            const serverUrl = results[1].getState("serverUrl");
            const subject = "subject=" + serverUrl;
            const patient = "/Patient/" + patientId;
            const include = "&_include=ServiceRequest:performer&_include:iterate=PractitionerRole:organization";

            const requestUrl = environment.bserProviderServer +
              "ServiceRequest?" +
              subject +
              patient +
              include;
            return this.http.get(requestUrl)
          }
        )
      );
  }


  getServiceRequestById(serviceRequestId: string) : Observable<ServiceRequest> {
    const requestUrl = environment.bserProviderServer + "/ServiceRequest/" + serviceRequestId;

    return this.http.get(requestUrl).pipe(map(result => {
        this.currentSnapshot.next(result);
        return  result as ServiceRequest;
      }
    ))
  }
}
