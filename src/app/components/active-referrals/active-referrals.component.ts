import { Component, OnInit } from '@angular/core';
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {MatTableDataSource} from "@angular/material/table";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrls: ['./active-referrals.component.scss']
})
export class ActiveReferralsComponent implements OnInit {

  displayedColumns: string[] = ['service', 'serviceProvider', 'status', 'dateCreated', 'lastUpdated', 'actions'];
  public dataSource = new MatTableDataSource<any>([]);
  isLoading: boolean = false;
  serviceRequestList: any[];

  activeServiceRequests: any[] = [];
  draftServiceRequests: any[] = [];
  completeServiceRequests: any[] = [];

  constructor(
    private mockDataRetrievalService: MockDataRetrievalService,
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private router: Router) { }

  findResourceById(bundle, resourceId){
    if(!bundle.entry || bundle.entry.length === 0 || !resourceId){
      return null;
    }
    return bundle.entry.find(entry => entry?.resource?.id === resourceId);
  }

  ngOnInit(): void {
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
              dateCreated: element.serviceRequest?.resource?.authored,
              lastUpdated: element.serviceRequest?.resource?.meta?.lastUpdated,
              service: element.serviceRequest?.resource?.orderDetail?.[0]?.text,
              status: element.serviceRequest?.resource?.status,
            }));

          this.draftServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'draft');
          this.activeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'active');
          this.completeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'complete');

          this.dataSource.data = this.draftServiceRequests;
        }
      }
    })

  }

  onEdit(element) {
    this.router.navigate(['referral-manager', element.serviceRequestId])
  }
}
