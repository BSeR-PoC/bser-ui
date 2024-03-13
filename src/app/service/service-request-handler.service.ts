import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ServiceRequest} from '@fhir-typescript/r4-core/dist/fhir/ServiceRequest';
import {BehaviorSubject, combineLatest, forkJoin, map, Observable, switchMap} from 'rxjs';
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

  // TODO: Why is only working as a BehaviorSubject and not just Subject?
  private currentSnapshot = new BehaviorSubject<ServiceRequest>(null);
  public currentSnapshot$ = this.currentSnapshot.asObservable();
  private currentParameters = new BehaviorSubject<Parameters>(null);
  public currentParameters$ = this.currentParameters.asObservable();
  private lastSnapshot: ServiceRequest = null;
  private lastParameters: Parameters = null;
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
      switchMap( result => patient$))
  }

  // STEP 0
  createNewServiceRequest() {

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
    this.lastSnapshot = new ServiceRequest(this.deepCopy(serviceRequest));
    this.lastParameters = new Parameters(this.deepCopy(parameters));
    this.currentSnapshot.next(serviceRequest);
    this.currentParameters.next(parameters);
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
      return this.transBundleHandler.sendTransactionBundle("POST", [currentSnapshot, currentParameters]).pipe(
        switchMap((data: any) => this.getServiceRequestAndParamsHelper(data)))
    }
    else {
      return this.transBundleHandler.sendTransactionBundle("PUT", [currentSnapshot, currentParameters]).pipe(
        switchMap((data: any) => this.getServiceRequestAndParamsHelper(data)))
    }
  }

  private getServiceRequestAndParamsHelper(data) : Observable<any> {

    const serviceRequestLocation = data.entry.find(element => element?.response?.location.indexOf('ServiceRequest') !== -1).response.location;
    const serviceRequestId = serviceRequestLocation.substring(serviceRequestLocation.indexOf('/') + 1, serviceRequestLocation.lastIndexOf('/_'));

    const parametersLocation = data.entry.find(element => element?.response?.location.indexOf('Parameters') !== -1).response.location;
    const paramsId = parametersLocation.substring(parametersLocation.indexOf('/') + 1, parametersLocation.lastIndexOf('/_'));

    return forkJoin([this.getServiceRequestById(serviceRequestId), this.getParametersById(paramsId)]).pipe(map(value=> {
      this.lastSnapshot = new ServiceRequest(value[0]);
      this.lastParameters = new Parameters (value[1]);
      this.currentSnapshot.next(new ServiceRequest (value[0]));
      this.currentParameters.next(new Parameters(value[1]));

      return value;
    }))
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
    currentSnapshot.orderDetail= [];
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
      data.entry.forEach(resource => {
        let id = resource.resource.id;
        this.http.delete(connectionUrl + "/" + id).toPromise().then(result => console.log(result));
      });
    });
  }

  getServiceRequestData() : Observable<MappedServiceRequest[]> {
    const patientMRN = this.patient.identifier.find((ident: any) => ident?.type?.coding?.[0]?.code === "MR");
    const identifierParameter: string = `identifier=${patientMRN.system}|${patientMRN.value}`

    const subject = "subject=" + this.serverUrl;
    const patient = "/Patient/" + this.patient.id;
    const include = "&_include=ServiceRequest:performer&_include:iterate=PractitionerRole:organization";
    const requestUrl = environment.bserProviderServer +
      "ServiceRequest?" +
      subject +
      patient +
      include;
    const drafts$ = this.http.get(requestUrl);

    const taskInclude = "_include=Task:focus&_include=Task:owner&_include:iterate=PractitionerRole:organization";
    const tasks$ = this.http.get(encodeURI(environment.bserProviderServer + "Task?" + taskInclude));

    return combineLatest([drafts$, tasks$]).pipe(
      map((combinedResults: [any, any]) => [...combinedResults[0].entry, ...combinedResults?.[1]?.entry]),
      map(results=> {
        return this.convertToMappedServiceRequests(results);
      })
    );
  }

  private convertToMappedServiceRequests(bundleEntries: any): MappedServiceRequest[] {
    const serviceRequestResources = bundleEntries.filter(entry => entry.resource.resourceType === "ServiceRequest");
    const taskResources = bundleEntries.filter(entry => entry.resource.resourceType === "Task");
    const organizationResources =  bundleEntries.filter(entry => entry.resource.resourceType === "Organization");
    const practitionerRoleResources = bundleEntries.filter(entry => entry.resource.resourceType === "PractitionerRole");

    let mappedServiceRequests = [];

    serviceRequestResources.forEach(serviceRequestBundleEntry => {

      //const performerBundleEntry = this.findResourceById(results, serviceRequestBundleEntry.resource?.performer?.[0].reference.replace('PractitionerRole/', ''));
      const practitionerRoleResourceId =  serviceRequestBundleEntry.resource?.performer?.[0].reference.replace('PractitionerRole/', '');
      let practitionerRoleResource = null;
      if(practitionerRoleResourceId){
        practitionerRoleResource = practitionerRoleResources.find(entry => entry.id == practitionerRoleResourceId)?.resource;
      }

      const performerOrgIdId =  practitionerRoleResource?.resource?.organization?.reference.replace('Organization/', '');
      let performerResource = null;
      if(practitionerRoleResourceId){
        performerResource = organizationResources.find(entry => entry.id == performerOrgIdId)?.resource;
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
    const requestUrl = environment.bserProviderServer + "ServiceRequest/" + serviceRequestId;

    return this.http.get(requestUrl).pipe(map(result => {
        this.lastSnapshot = new ServiceRequest(this.deepCopy(result));
        this.currentSnapshot.next(new ServiceRequest(result));
        return  result as ServiceRequest;
      }
    ))
  }

  //TODO considering that we are using FHIR API we don't need any other het methods
  getDataByQueryStr(str){
    const requestUrl = environment.bserProviderServer + str;
    return this.http.get(requestUrl);
  }

  deleteServiceRequest(serviceRequestId: any)  : Observable<any> {
    let connectionUrl = environment.bserProviderServer + "ServiceRequest";
    return this.http.delete(connectionUrl + "/" + serviceRequestId)
  }

  getParametersById(paramsId: string) {
    const requestUrl = environment.bserProviderServer + "Parameters/" + paramsId;

    return this.http.get(requestUrl).pipe(map(result => {
        this.lastParameters = new Parameters(this.deepCopy(result));
        this.currentParameters.next(new Parameters(result));
        return  result as Parameters;
      }
    ))
  }

}
