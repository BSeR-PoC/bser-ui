import { Component, OnInit } from '@angular/core';
import { ServiceRequest } from '@fhir-typescript/r4-core/dist/fhir';
import { ServiceRequestHandlerService } from '../service/service-request-handler.service';
import {PractitionerRole} from "@fhir-typescript/r4-core/dist/fhir/PractitionerRole";
import {FhirClientService} from "../fhir-client.service";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {ServiceProviderService} from "../service/service-provider.service";

@Component({
  selector: 'app-service-request-tester',
  templateUrl: './service-request-tester.component.html',
  styleUrls: ['./service-request-tester.component.scss']
})
export class ServiceRequestTesterComponent implements OnInit {

  currentSnapshot: ServiceRequest;
  lastSnapshot: ServiceRequest;
  currentParameters: Parameters;
  lastParameters: Parameters;

  constructor(public serviceRequestHandler: ServiceRequestHandlerService, private serviceProviderService: ServiceProviderService) { }

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
    this.serviceRequestHandler.currentParameters$.subscribe(
      {
        next: (data: any) => {
          this.currentParameters = data;
          console.log("DATA:", data)
        },
        error: console.error
      }
    );
    this.serviceProviderService.getServiceProviders().subscribe(
      {
        next: (results: any) => {
          console.log(results);
        }
      }
    )
  }

  saveServiceRequest(serviceRequest: ServiceRequest) {
    this.serviceRequestHandler.saveServiceRequest(serviceRequest).subscribe(
      {
        next: (data: any) => {
          this.lastSnapshot = this.serviceRequestHandler.deepCopy(data);
          this.currentSnapshot = this.serviceRequestHandler.deepCopy(data);
        },
        error: console.error
      }
    );
  }
}
