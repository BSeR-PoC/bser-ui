import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ServiceRequest} from '@fhir-typescript/r4-core/dist/fhir/ServiceRequest';
import {BehaviorSubject, combineLatest, forkJoin, map, Observable, of, switchMap, tap} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Reference} from "@fhir-typescript/r4-core/dist/fhir/Reference";
import {PractitionerRole} from "@fhir-typescript/r4-core/dist/fhir/PractitionerRole";
import {v4 as uuidv4} from 'uuid';
import {FhirClientService} from "./fhir-client.service";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";
import {Parameters, ParametersParameter} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {CodeableConcept} from "@fhir-typescript/r4-core/dist/fhir/CodeableConcept";
import {Coding} from "@fhir-typescript/r4-core/dist/fhir/Coding";
import {TransactionBundleHandlerService} from "./transaction-bundle-handler.service";
import {MappedServiceRequest} from "../models/mapped-service-request";

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestHandlerService {

  private practitioner: any;
  private patient: any;
  private serverUrl: string;

  private _mappedServiceRequests = new BehaviorSubject<MappedServiceRequest[]>([]);
  public mappedServiceRequests = this._mappedServiceRequests.asObservable();

  setMappedServiceRequests(mappedServiceRequests: MappedServiceRequest[]){
    this._mappedServiceRequests.next(mappedServiceRequests);
  }

  constructor(private http: HttpClient, private fhirClient: FhirClientService,
              private transBundleHandler: TransactionBundleHandlerService) {
  }

  initClient(): Observable<any>{
    const practitioner$ = this.fhirClient.getPractitioner().pipe(map(result => this.practitioner = result));
    const patient$ = this.fhirClient.getPatient().pipe(map(result => this.patient = result));
    const serverUrl$ = this.fhirClient.serverUrl$.pipe(map(result => this.serverUrl = result));

    return practitioner$.pipe(
      switchMap(result => serverUrl$),
      switchMap( result => patient$))}

  // STEP 0
  createNewServiceRequest(): Observable<{ currentSnapshot: ServiceRequest; currentParameters: Parameters; }> {

    //TODO: delete the codeable concept code, it should come from the UI when the user selects the Recipient
    // let coding = new Coding({code: "diabetes-prevention", display : "Diabetes Prevention"});
    // let codeableConcept = new CodeableConcept({coding: [coding], text: "Diabetes Prevention"});
    // console.log(codeableConcept);

    this.practitioner = Object.assign(new Practitioner(), this.practitioner);
    let parameters = new Parameters( {id: uuidv4()});
    let serviceRequest = new ServiceRequest({
      code: this.createServiceRequestCoding(),
      requester: Reference.fromResource(this.practitioner, this.serverUrl),
      // requester: Reference.fromResource(practitioner),
      status: "draft",
      intent: "order",
      authoredOn: new Date().toISOString(),
      //supportingInfo: [Reference.fromResource(parameters, environment.bserProviderServer)],
      supportingInfo: [Reference.fromResource(parameters)],
      subject: Reference.fromResource(this.patient, this.serverUrl),
      //      orderDetail: [new CodeableConcept(codeableConcept)]
      //subject: Reference.fromResource(patient),
    });
    // this.lastSnapshot = new ServiceRequest(this.deepCopy(serviceRequest));
    // this.lastParameters = new Parameters(this.deepCopy(parameters));
    // this.currentSnapshot.next(serviceRequest);
    // this.currentParameters.next(parameters);
    return of({ currentSnapshot: serviceRequest, currentParameters: parameters })
  }

  private createServiceRequestCoding(): CodeableConcept {
    let coding = new Coding({system: "http://snomed.info/sct", code: "3457005", display: "Patient referral (procedure)"})
    let codeableConcept = new CodeableConcept({coding: [coding], text: "Draft BSeR Referral"})
    return codeableConcept
  }

  saveServiceRequest(currentSnapshot: ServiceRequest, currentParameters: Parameters) : Observable<any> {
    if (currentSnapshot.meta) {
      console.log("Removing Service Request Version")
      currentSnapshot.meta = null;
    }
    if (currentParameters.meta) {
      console.log("Removing Parameters Version")
      currentParameters.meta = null;
    }
    (console.log(currentSnapshot))


    if (!(currentSnapshot.id)) {
      return this.transBundleHandler.sendTransactionBundle("POST", [currentSnapshot, currentParameters])
    }
    else {
      return this.transBundleHandler.sendTransactionBundle("PUT", [currentSnapshot, currentParameters])
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

    currentSnapshot.performer = [];
    currentSnapshot.performer.push(Reference.fromResource(recipientTest));
  }

  setServiceType(currentSnapshot: ServiceRequest, serviceType: CodeableConcept) {
    currentSnapshot.orderDetail= [];
    currentSnapshot.orderDetail.push(serviceType);
  }

  // Helper Functions
  public deepCopy(object: any): any {
    // TODO: Can be replaced by structuredClone in Node 17.
    return JSON.parse(JSON.stringify(object));
  }

  public deepCompare(object1: any, object2): boolean {
    // Returns true if contents same.
    return JSON.stringify(object1) === JSON.stringify(object2);
  }

  getServiceRequestData() : Observable<MappedServiceRequest[]> {
    const patientMRN = this.patient.identifier.find((ident: any) => ident?.type?.coding?.[0]?.code === "MR");

    // Construct the Draft ServiceRequest HTTP Request
    const subject = `${this.serverUrl}/Patient/${this.patient.id}`;
    const include = "&_include=ServiceRequest:performer&_include:iterate=PractitionerRole:organization";
    const draftRequestUrl = encodeURI(environment.bserProviderServer + "ServiceRequest?subject=" + subject + include);
    const getDrafts$ = this.http.get(draftRequestUrl)

    // Construct the Active/Complete Task HTTP Request
    const taskSubject: string = `patient.identifier=${patientMRN.value}`
    const taskInclude = "&_include=Task:focus&_include=Task:owner&_include:iterate=PractitionerRole:organization";
    const taskRequestUrl = encodeURI(environment.bserProviderServer + "Task?" + taskSubject + taskInclude);
    const getTasks$ = this.http.get(taskRequestUrl)

    return combineLatest([getDrafts$, getTasks$]).pipe(
      map((combinedResults: [any, any]) => {
        let result = [];
        if(combinedResults?.[0]?.entry){
          result = [...result, ...combinedResults?.[0]?.entry];
        }
        if(combinedResults?.[1]?.entry){
          result = [...result, ...combinedResults?.[1]?.entry];
        }
        return result;
      }),
      map(results=> this.convertToMappedServiceRequests(results))
    );
  }

  private convertToMappedServiceRequests(bundleEntries: any): MappedServiceRequest[] {
    const serviceRequestResources = bundleEntries.filter(entry => entry.resource.resourceType === "ServiceRequest");
    const taskResources = bundleEntries.filter(entry => entry.resource.resourceType === "Task");
    const organizationResources =  bundleEntries.filter(entry => entry.resource.resourceType === "Organization");
    const practitionerRoleResources = bundleEntries.filter(entry => entry.resource.resourceType === "PractitionerRole");

    let mappedServiceRequests = [];

    serviceRequestResources.forEach(serviceRequestBundleEntry => {

      const practitionerRoleResourceId =  serviceRequestBundleEntry.resource?.performer?.[0].reference.replace('PractitionerRole/', '');
      let practitionerRoleResource = null;
      if(practitionerRoleResourceId){
        practitionerRoleResource = practitionerRoleResources.find(entry => entry.resource.id == practitionerRoleResourceId)?.resource;
      }
      const performerOrgIdId =  practitionerRoleResource?.organization?.reference?.replace('Organization/', '')
      let performerResource = null;
      if(performerOrgIdId){
        performerResource = organizationResources.find(entry => entry.resource.id == performerOrgIdId)?.resource;
      }

      const taskResource = taskResources.find(task => {
        const serviceRequestReferenceId = task.resource?.focus?.reference?.replace("ServiceRequest/", "");
        return serviceRequestReferenceId == serviceRequestBundleEntry.resource.id;
      })?.resource;

      mappedServiceRequests.push(new MappedServiceRequest(serviceRequestBundleEntry.resource, performerResource, taskResource));
    });
    return  mappedServiceRequests;
  }

  getServiceRequestById(serviceRequestId: string) : Observable<ServiceRequest> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
      })
    }
    const requestUrl = environment.bserProviderServer + "ServiceRequest/" + serviceRequestId;

    return this.http.get(requestUrl, httpOptions)
      .pipe(map(result => {
        return  result as ServiceRequest;
      }
    ))
  }

  //TODO considering that we are using FHIR API we don't need any other get methods
  getDataByQueryStr(str){
    const requestUrl = environment.bserProviderServer + str;
    return this.http.get(requestUrl);
  }

  deleteServiceRequest(serviceRequestId: any)  : Observable<any> {
    let connectionUrl = environment.bserProviderServer + "ServiceRequest";
    return this.http.delete(connectionUrl + "/" + serviceRequestId)
  }

  getParametersById(paramsId: string) {
    const requestUrl = `${environment.bserProviderServer}Parameters/${paramsId}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
      })
    }
    return this.http.get(requestUrl, httpOptions).pipe(
      map(result => {
        return  result as Parameters;
      }
    ))
  }

}
