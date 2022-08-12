import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceRequest } from '@fhir-typescript/r4-core/dist/fhir/ServiceRequest';
import {BehaviorSubject, catchError, Subject} from 'rxjs';
import { environment } from 'src/environments/environment';
import {Reference} from "@fhir-typescript/r4-core/dist/fhir/Reference";
import {DomainResource} from "@fhir-typescript/r4-core/dist/fhir/DomainResource";
import {Resource} from "@fhir-typescript/r4-core/dist/fhir/Resource";
import {PractitionerRole} from "@fhir-typescript/r4-core/dist/fhir/PractitionerRole";
import {v4 as uuidv4} from 'uuid';
import {FhirClientService} from "../fhir-client.service";
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";
import {FhirDateTime} from "@fhir-typescript/r4-core/dist/fhir/FhirDateTime";

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestHandlerService {

  // TODO: Why is only working as a BehaviorSubject and not just Subject?
  private currentSnapshot = new BehaviorSubject<any>(null);
  public currentSnapshot$ = this.currentSnapshot.asObservable();
  private lastSnapshot: ServiceRequest = null;

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

  createNewServiceRequest() {
    //let code = createServiceRequestCoding();
    this.fhirClient.getPractitioner().subscribe({
      next: practitioner => {
        this.practitioner = Object.assign(new Practitioner(), practitioner);
        let serviceRequest = new ServiceRequest({
          requester: Reference.fromResource(practitioner),
          status: "draft",
          intent: "order",
          authoredOn: new Date().toISOString()
        });
        this.lastSnapshot = new ServiceRequest(this.deepCopy(serviceRequest));
        console.log(serviceRequest)
        console.log(this.lastSnapshot)
        this.currentSnapshot.next(serviceRequest);
        console.log("SERVICE REQUEST CREATED");
      }
    });
  }

  checkIfSnapshotStateChanged(currentSnapshot: ServiceRequest): boolean {
    // Compare currentSnapshot to lastSnapshot.
    if (this.deepCompare(currentSnapshot, this.lastSnapshot)) {
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
}
