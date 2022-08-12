import { Injectable } from '@angular/core';
import { ServiceRequest } from '@fhir-typescript/r4-core/dist/fhir/ServiceRequest';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestHandlerService {

  private currentSnapshot$ = new Subject<ServiceRequest>();
  private currentSnapshot = this.currentSnapshot$.asObservable();
  private lastSnapshot: ServiceRequest;

  public serviceRequest: ServiceRequest = undefined;
  
  constructor() {}

  createNewServiceRequest() {
    this.serviceRequest = new ServiceRequest();
    console.log("SERVICE REQUEST CREATED");
    console.log(this.serviceRequest);
  }

  checkIfSnapshotStateChanged(currentSnapshot: ServiceRequest): boolean {
    // Compare currentSnapshot to lastSnapshot.
    if (this.lastSnapshot === currentSnapshot) {
      return false
    }
    else return true;
  }

  saveServiceRequest(currentSnapshot: ServiceRequest) {
    // Write to Server.
    // Move this to occur after http resonse is success. Use returned server response?
    this.lastSnapshot = currentSnapshot
  }
}
