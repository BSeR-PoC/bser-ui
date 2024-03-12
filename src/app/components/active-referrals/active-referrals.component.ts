import {Component, OnInit} from '@angular/core';
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {ActivatedRoute} from "@angular/router";
import {forkJoin, mergeMap} from "rxjs";

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrl: './active-referrals.component.scss'
})
export class ActiveReferralsComponent implements OnInit{

  serviceRequest: any;
  supportingInfo: any;
  taskResource: any;

  constructor(private serviceRequestHandler: ServiceRequestHandlerService, private activeRoute: ActivatedRoute){}
  ngOnInit(): void {

    const taskId = this.activeRoute.snapshot.params['taskId'];

    this.serviceRequestHandler.getDataByQueryStr("Task/" + taskId).pipe(
      mergeMap(taskResource=> {
        this.taskResource = taskResource;
        const serviceRequestRef = this.taskResource?.focus?.reference;
        if(serviceRequestRef){
          return this.serviceRequestHandler.getDataByQueryStr(serviceRequestRef)
        }
        else {
          console.error("Task Resource missing Service Request ID " + JSON.stringify(this.taskResource));
          return null;
        }
      }),
      mergeMap(serviceRequest=> {
        this.serviceRequest = serviceRequest;
        const supportingInfoBundleRef =  this.serviceRequest?.supportingInfo?.[0]?.reference;
        if(supportingInfoBundleRef){
          return this.serviceRequestHandler.getDataByQueryStr(supportingInfoBundleRef)
        }
        else {
          console.error("Service Request Resource missing Supporting InfoBundle Ref (ServiceRequest.supportingInfo[0].reference) "
            + JSON.stringify(this.serviceRequest));
          return null;
        }
      }),
    ).subscribe({
      next: supportingInfoBundle => {
        //TODO we can use a common model such as the one we have when we load the initial data, but we have to refactor it (perhaps use inheritance)
        this.supportingInfo = supportingInfoBundle;
      },
      error: err => console.log
    });
  }
}
