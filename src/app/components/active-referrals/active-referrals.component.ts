import { Component, OnInit } from '@angular/core';
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {MatTableDataSource} from "@angular/material/table";
import {catchError, forkJoin, map, mergeMap, Observable, of, switchMap} from "rxjs";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrls: ['./active-referrals.component.scss']
})
export class ActiveReferralsComponent implements OnInit {

  displayedColumns: string[] = ['service', 'serviceProvider', 'status', 'dateCreated', 'lastUpdated'];
  public dataSource = new MatTableDataSource<any>([]);
  isLoading: boolean = false;
  activeReferrals$: Observable<any[]>;

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
    this.getActiveReferrals();

    this.serviceRequestHandlerService.getServiceRequestList().subscribe({
      next: value => console.log(value)
    })

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
                  ({
                    serviceRequest: serviceRequest,
                    performer: result[0],
                    requester: result[1],
                    subject: result[2]
                  })
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
      next: value => {
        console.log(value)
      }
    });

  }



}
