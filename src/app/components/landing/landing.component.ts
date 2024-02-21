import {Component, OnInit, SimpleChanges} from '@angular/core';
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Router} from "@angular/router";
import {FhirClientService} from "../../service/fhir-client.service";
import {ServiceRequestStatusType} from "../../domain/service-request-status-type"
import {MappedServiceRequest} from "../../models/mapped-service-request";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  isLoading: boolean = false;
  serviceRequestList: any[];
  selectedServiceRequestType: ServiceRequestStatusType = ServiceRequestStatusType.draft;

  activeServiceRequests: any[] = [];
  draftServiceRequests: any[] = [];
  completeServiceRequests: any[] = [];

  constructor(
    private mockDataRetrievalService: MockDataRetrievalService,
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private router: Router,
    private fhirClient: FhirClientService) {

    this.fhirClient.readyClient();
  }

  findResourceById(bundle, resourceId){
    if(!bundle.entry || bundle.entry.length === 0 || !resourceId){
      return null;
    }
    return bundle.entry.find(entry => entry?.resource?.id === resourceId);
  }

  getServiceRequests(){
    this.isLoading = true;
    this.serviceRequestHandlerService.getServiceRequestList().subscribe({
      next: results => {

        this.isLoading = false;

        if (results.entry && results.entry.length) {

          this.serviceRequestList = results.entry.filter(entry => entry.resource.resourceType === "ServiceRequest");

          let mappedServiceRequests: MappedServiceRequest[] = []
          this.serviceRequestList.forEach(serviceRequestBundleEntry => {
            const performerBundleEntry = this.findResourceById(results, serviceRequestBundleEntry.resource?.performer?.[0].reference.replace('PractitionerRole/', ''));
            const performerOrganizationBundleEntry = this.findResourceById(results, performerBundleEntry?.resource?.organization?.reference.replace('Organization/', ''));
            mappedServiceRequests.push(new MappedServiceRequest(serviceRequestBundleEntry.resource, performerOrganizationBundleEntry?.resource, undefined));
          })

          console.log(mappedServiceRequests[0]);
          this.draftServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'draft');
          this.activeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'active');
          this.completeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'complete');
        }
      }
    })

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.serviceRequestHandlerService.initClient().subscribe({
      next: result =>
        this.getServiceRequests()
    })
  }

  onEdit(element) {
    this.router.navigate(['referral-manager', element.serviceRequestId])
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    console.log(this.fhirClient);
  }

  protected readonly ServiceRequestStatusType = ServiceRequestStatusType;


  onSelectServiceRequestType(tabNumber: number) {
    switch (tabNumber){
      case (0): {this.selectedServiceRequestType = ServiceRequestStatusType.draft; break }
      case (1): {this.selectedServiceRequestType = ServiceRequestStatusType.active; break }
      case (2): {this.selectedServiceRequestType = ServiceRequestStatusType.completed; break }
    }
  }

}
