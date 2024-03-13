import {Component, OnInit} from '@angular/core';
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {FhirClientService} from "../../service/fhir-client.service";
import {ServiceRequestStatusType} from "../../models/service-request-status-type"
import {UtilsService} from "../../service/utils.service";
import {mergeMap} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  isLoading: boolean = false;
  selectedServiceRequestType: ServiceRequestStatusType = ServiceRequestStatusType.draft;

  activeServiceRequests: any[] = [];
  draftServiceRequests: any[] = [];
  completeServiceRequests: any[] = [];

  constructor(
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private utilsService: UtilsService,
    private fhirClient: FhirClientService) {
    this.fhirClient.readyClient();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.serviceRequestHandlerService.initClient().pipe(
      mergeMap(result=> this.serviceRequestHandlerService.getServiceRequestData())
    ).subscribe({
      next: mappedServiceRequests=> {
        this.isLoading = false;
        this.serviceRequestHandlerService.setMappedServiceRequests(mappedServiceRequests);

        this.draftServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'draft');
        this.activeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'active');
        this.completeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'complete');
      },
      error: err => {
        this.isLoading = false;
        console.error(err);
      }
    })

  }

  onSelectServiceRequestType(tabNumber: number) {
    switch (tabNumber){
      case (0): {this.selectedServiceRequestType = ServiceRequestStatusType.draft; break }
      case (1): {this.selectedServiceRequestType = ServiceRequestStatusType.active; break }
      case (2): {this.selectedServiceRequestType = ServiceRequestStatusType.completed; break }
    }
  }

}
