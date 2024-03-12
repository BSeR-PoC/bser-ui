import {Component, OnInit} from '@angular/core';
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {ActivatedRoute} from "@angular/router";
import {skipWhile, switchMap} from "rxjs";

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrl: './active-referrals.component.scss'
})
export class ActiveReferralsComponent implements OnInit{

  serviceRequest: any;
  data: any;

  constructor(private serviceRequestHandler: ServiceRequestHandlerService, private activeRoute: ActivatedRoute){}
  ngOnInit(): void {
    this.serviceRequestHandler.mappedServiceRequests.pipe(
      skipWhile(mappedServiceRequests => !mappedServiceRequests?.length),
      switchMap(mappedServiceRequests => {
          const serviceRequestID = this.activeRoute.snapshot.params['serviceRequestId'];
          this.serviceRequest = mappedServiceRequests.find(serviceRequest => serviceRequest.serviceRequestId == serviceRequestID);
          return this.serviceRequestHandler.getDataByQueryStr(this.serviceRequest.supportingInfoRef);
        })
    ).subscribe({
      next: value=> this.data = value
    })
  }
}
