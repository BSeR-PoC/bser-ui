import {Component, OnInit} from '@angular/core';
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {FhirClientService} from "../../service/fhir-client.service";
import {ServiceRequestStatusType} from "../../domain/service-request-status-type"
import {MappedServiceRequest} from "../../models/mapped-service-request";
import {UtilsService} from "../../service/utils.service";

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
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private utilsService: UtilsService,
    private fhirClient: FhirClientService) {
    this.fhirClient.readyClient();
  }

  findResourceById(entryList, resourceId){
    if(!entryList || entryList.length === 0 || !resourceId){
      return null;
    }
    return entryList.find(entry => entry?.resource?.id === resourceId);
  }

  getServiceRequests() {
    this.isLoading = true;
    this.serviceRequestHandlerService.getServiceRequestList().subscribe({
      next: results => {
        this.isLoading = false;

        this.serviceRequestList = results.filter(entry => entry.resource.resourceType === "ServiceRequest");
        const taskList = results.filter(entry => entry.resource.resourceType === "Task");
        let mappedServiceRequests: MappedServiceRequest[] = []

        this.serviceRequestList.forEach(serviceRequestBundleEntry => {

          const performerBundleEntry = this.findResourceById(results, serviceRequestBundleEntry.resource?.performer?.[0].reference.replace('PractitionerRole/', ''));

          const performerOrganizationBundleEntry = this.findResourceById(results, performerBundleEntry?.resource?.organization?.reference.replace('Organization/', ''));

          const taskEntry = taskList.find(task => {
            const serviceRequestReferenceId = task.resource?.focus?.reference?.replace("ServiceRequest/", "");
            return serviceRequestReferenceId == serviceRequestBundleEntry.resource.id;
          });

          mappedServiceRequests.push(new MappedServiceRequest(serviceRequestBundleEntry.resource, performerOrganizationBundleEntry?.resource, taskEntry?.resource));
        });

        this.draftServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'draft');
        this.activeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'active');
        this.completeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'complete');
      },
      error: err=> {
        console.error(err);
        this.utilsService.showErrorNotification();
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

  onSelectServiceRequestType(tabNumber: number) {
    switch (tabNumber){
      case (0): {this.selectedServiceRequestType = ServiceRequestStatusType.draft; break }
      case (1): {this.selectedServiceRequestType = ServiceRequestStatusType.active; break }
      case (2): {this.selectedServiceRequestType = ServiceRequestStatusType.completed; break }
    }
  }

}
