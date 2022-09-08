import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Router} from "@angular/router";
import {FhirClientService} from "../../service/fhir-client.service";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  isLoading: boolean = false;
  serviceRequestList: any[];

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

          let mappedServiceRequests = this.serviceRequestList
            .map(element => ({
              serviceRequest: element,
              performer: this.findResourceById(results, element.resource?.performer?.[0].reference.replace('PractitionerRole/', ''))
            }))
            .map(element => ({
              serviceRequest: element.serviceRequest,
              performerOrganization: this.findResourceById(results, element.performer?.resource?.organization?.reference.replace('Organization/', ''))
            }))
            .map(element => ({
              serviceRequestId: element.serviceRequest?.resource?.id,
              serviceProvider: element.performerOrganization?.resource.name,
              dateCreated: element.serviceRequest?.resource?.authoredOn,
              lastUpdated: element.serviceRequest?.resource?.meta?.lastUpdated,
              service: element.serviceRequest?.resource?.orderDetail?.[0]?.text,
              status: element.serviceRequest?.resource?.status,
            }));

          this.draftServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'draft');
          this.activeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'active');
          this.completeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'complete');
        }
      }
    })

  }

  ngOnInit(): void {
   this.fhirClient.patient$.subscribe({
     //TODO there should be a better way to to this, we need to refactor the code and handle this in the service
     next: value => { if(value) this.getServiceRequests();}
   })
  }

  onEdit(element) {
    this.router.navigate(['referral-manager', element.serviceRequestId])
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    console.log(this.fhirClient);
  }
}
