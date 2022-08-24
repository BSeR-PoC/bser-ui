import { Component, OnInit } from '@angular/core';
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {MatTableDataSource} from "@angular/material/table";
import {map, mergeMap, Observable} from "rxjs";
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
    });

    this.serviceRequestHandlerService
      .getServiceRequestList()
      .pipe(
        mergeMap((result) => {
          console.log(result);
          return result;
         // return this.serviceRequestHandlerService.getResourceFromUrl(result.resource[0].performer[0].reference)
        }
        )
      ).subscribe({
      next: (value) => console.log(value)
    })
  }


}
