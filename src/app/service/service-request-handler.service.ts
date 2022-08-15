import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceRequest } from '@fhir-typescript/r4-core/dist/fhir/ServiceRequest';
import {BehaviorSubject, catchError, Subject} from 'rxjs';
import { environment } from 'src/environments/environment';
import {Reference} from "@fhir-typescript/r4-core/dist/fhir/Reference";
import {PractitionerRole} from "@fhir-typescript/r4-core/dist/fhir/PractitionerRole";
import {v4 as uuidv4} from 'uuid';
import {FhirClientService} from "../fhir-client.service";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";
import {Parameters, ParametersParameter} from "@fhir-typescript/r4-core/dist/fhir/Parameters";

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

  deepCopy(object: any): any {
    // TODO: Can be replaced by structuredClone in Node 17.
    return JSON.parse(JSON.stringify(object));
  }

  deepCompare(object1: any, object2): boolean {
    // Returns true if contents same.
    return JSON.stringify(object1) === JSON.stringify(object2);
  }

  // STEP 1
  public getServiceProviders() {}

  // STEP 2
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

  private createServiceRequestCoding() {
    // TODO: Implement Coding
    // "code": {
    //   "coding": [
    //     {
    //       "system": "http://snomed.info/sct",
    //       "code": "3457005",
    //       "display": "Patient referral (procedure)"
    //     }
    //   ],
    //     "text": "Draft BSeR Referral"
    // },
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
    // Write to Server.
    // Move this to occur after http response is success. Use returned server response?
    let connectionUrl = environment.bserProviderServer + "ServiceRequest";
    this.lastSnapshot = currentSnapshot;
    return this.http.post(connectionUrl, currentSnapshot);
  }

  setRecipient(currentSnapshot: ServiceRequest, recipient: PractitionerRole) {
    let recipientTest = new PractitionerRole({id: uuidv4() })
    currentSnapshot.performer.length = 0;
    currentSnapshot.performer.push(Reference.fromResource(recipientTest));
  }


  setParameter(currentParameters: Parameters, name: string, type: string, value: string) {
    let parameter = new ParametersParameter({name: "test", valueString: value});
    currentParameters.parameter.push(parameter);
    this.currentParameters.next(currentParameters);
    // typeMatchDictionary[name]
    // { "name": name, typeMatchDictionary[name]: value }
  }

  // { "name": type }
  // { "serviceType" : "valueCode", "educationLevel" : "code" }

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
