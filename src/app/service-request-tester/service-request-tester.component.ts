import { Component, OnInit } from '@angular/core';
import { ServiceRequest } from '@fhir-typescript/r4-core/dist/fhir';
import { ServiceRequestHandlerService } from '../service/service-request-handler.service';
import {PractitionerRole} from "@fhir-typescript/r4-core/dist/fhir/PractitionerRole";
import {FhirClientService} from "../fhir-client.service";

@Component({
  selector: 'app-service-request-tester',
  templateUrl: './service-request-tester.component.html',
  styleUrls: ['./service-request-tester.component.scss']
})
export class ServiceRequestTesterComponent implements OnInit {

  currentSnapshot: ServiceRequest;
  lastSnapshot: ServiceRequest;

  constructor(public serviceRequestHandler: ServiceRequestHandlerService) { }

  ngOnInit(): void {
      // TODO: REMOVE THIS COMPONENT INCLUDING ROUTE, TESTING ONLY
      console.log("Loading Service Request Testing Component");
      this.serviceRequestHandler.createNewServiceRequest();
      this.serviceRequestHandler.currentSnapshot$.subscribe(
        {
          next: (data: any) => {
            this.currentSnapshot = data;
            console.log("DATA:", data)
          },
          error: console.error
        }
      );
  }

  saveServiceRequest(serviceRequest: ServiceRequest) {
    this.serviceRequestHandler.saveServiceRequest(serviceRequest).subscribe(
      {
        next: (data: any) => {
          this.lastSnapshot = Object.assign({}, data)
          this.currentSnapshot = Object.assign({}, data);
        },
        error: console.error
      }
    );
  }
}
