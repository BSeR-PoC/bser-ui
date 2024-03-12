import {Component, OnInit} from '@angular/core';
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrl: './active-referrals.component.scss'
})
export class ActiveReferralsComponent implements OnInit{

  serviceRequest: any;

  constructor(private serviceRequestHandler: ServiceRequestHandlerService, private activeRoute: ActivatedRoute){}
  ngOnInit(): void {
    this.serviceRequestHandler.mappedServiceRequests.subscribe(mappedServiceRequests => {
      // always route the user to the landing page when they load or refresh the app. This is because the data to app is loaded only once.
      const serviceRequestID = this.activeRoute.snapshot.params['serviceRequestId'];
      this.serviceRequest = mappedServiceRequests.find(serviceRequest => serviceRequest.serviceRequestId == serviceRequestID);
    })
  }
}
