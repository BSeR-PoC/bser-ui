import { Component, OnInit } from '@angular/core';
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {MatTableDataSource} from "@angular/material/table";
import {catchError, forkJoin, map, switchMap} from "rxjs";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrls: ['./active-referrals.component.scss']
})
export class ActiveReferralsComponent implements OnInit {

  displayedColumns: string[] = ['service', 'serviceProvider', 'status', 'dateCreated', 'lastUpdated'];
  public dataSource = new MatTableDataSource<any>([]);
  isLoading: boolean = false;
  serviceRequestList: any[];

  activeServiceRequests: any[] = [];
  draftServiceRequests: any[] = [];
  completeServiceRequests: any[] = [];

  constructor(private mockDataRetrievalService: MockDataRetrievalService,
              private serviceRequestHandlerService: ServiceRequestHandlerService) { }

  getActiveReferrals(){

    this.isLoading = true;

    this.mockDataRetrievalService.getActiveReferrals()
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  ngOnInit(): void {

      this.serviceRequestHandlerService
      .getServiceRequestList()
      .pipe(
        switchMap(serviceRequestList =>
          forkJoin(
            serviceRequestList.map(
              serviceRequest => forkJoin([
                this.serviceRequestHandlerService.getResourceFromUrl(serviceRequest.resource?.performer?.[0]?.reference),
                this.serviceRequestHandlerService.getResourceFromUrl(serviceRequest.resource?.requester?.reference),
                this.serviceRequestHandlerService.getResourceFromUrl(serviceRequest.resource?.subject?.reference),

              ]).pipe(
                map (result=>
                  //TODO we may have to map the resources to some FHIR type, but for now we just create something we can use.
                  ({
                    serviceRequest: serviceRequest,
                    performer: result[0],
                    requester: result[1],
                    subject: result[2]
                  })
                )
              )
            )
          ).pipe(
            switchMap(serviceRequestList =>
              forkJoin(
                serviceRequestList.map(
                  serviceRequest => forkJoin([
                    this.serviceRequestHandlerService.getResourceFromUrl(environment.bserProviderServer + serviceRequest.performer.practitioner.reference),
                    this.serviceRequestHandlerService.getResourceFromUrl(environment.bserProviderServer + serviceRequest.performer.organization.reference)
                  ]).pipe(
                    map( result =>
                      ({
                        serviceRequest: serviceRequest.serviceRequest,
                        performerPractitioner: result[0],
                        performerOrganization: result[1],
                        performer: serviceRequest.performer,
                        requester: serviceRequest.requester,
                        subject: serviceRequest.subject
                      })
                    )
                  )
                )
              )
            )
          )
        ),
        catchError(error => {
          console.log(error);
          return null;
        })
      ).subscribe({
      next: results => {
        this.serviceRequestList = results as Array<any>;

        const mappedServiceRequests = this.serviceRequestList
          .map(serviceRequest => ({
            requesterId: serviceRequest.serviceRequest?.resource?.id,
            serviceProvider: serviceRequest.performerOrganization?.name,
            dateCreated: serviceRequest.serviceRequest?.resource?.authoredOn,
            lastUpdated: serviceRequest.serviceRequest?.resource?.meta?.lastUpdated,
            service: "unknown parameter",
            status: serviceRequest.serviceRequest?.resource?.status,
          }));

        this.draftServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'draft');
        this.activeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'active');
        this.completeServiceRequests = mappedServiceRequests.filter(serviceRequest => serviceRequest.status === 'complete');

        this.dataSource.data = this.draftServiceRequests;
      }
    });
  }

}
