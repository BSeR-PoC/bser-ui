import {Component, OnInit} from '@angular/core';
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {ActivatedRoute} from "@angular/router";
import {mergeMap, tap} from "rxjs";

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrl: './active-referrals.component.scss'
})
export class ActiveReferralsComponent implements OnInit{

  serviceRequest: any;
  supportingInfo: any;
  practitionerInfo: any;
  constructor(private serviceRequestHandler: ServiceRequestHandlerService, private activeRoute: ActivatedRoute){}
  ngOnInit(): void {

    const serviceRequestId = "624646";
    this.serviceRequestHandler.getServiceRequestById(serviceRequestId).
    pipe(
      tap(sr=> this.serviceRequest = sr),

      mergeMap(value=> {
        const referenceStr = this.serviceRequest.supportingInfo.find(param => param?.type === "Parameters")?.reference;
        if(!referenceStr){
          return null;
        }
        else {
          return this.serviceRequestHandler.getDataByQueryStr(referenceStr);
        }
      }),
      tap(si=> this.supportingInfo = si),

      mergeMap(value=> {
        const referenceStr = this.serviceRequest.performer.find(param => param?.type === "PractitionerRole")?.reference;
        if(!referenceStr){
          return null;
        }
        else {
          return this.serviceRequestHandler.getDataByQueryStr(referenceStr);
        }
      }),

      mergeMap((pr: any)=> {
        const referenceStr = pr?.organization.reference;
        if(!referenceStr){
          return null;
        }
        else {
          return this.serviceRequestHandler.getDataByQueryStr(referenceStr);
        }
      }),

    ).subscribe({
      next: value => {
        this.practitionerInfo = value;
        console.log(value)
      }
    });


    // this.serviceRequestHandler.getServiceRequestById(serviceRequestId).
    // pipe(
    //   tap(sr=> this.serviceRequest = sr),
    //   mergeMap(value=> {
    //     const paramsId = this.serviceRequest.supportingInfo.find(param => param?.type === "Parameters")?.reference?.replace("Parameters/", "");
    //     if(!paramsId){
    //       return null;
    //     }
    //     else {
    //       return this.serviceRequestHandler.getParametersById(paramsId);
    //     }
    //   }),
    //   tap(si=> this.supportingInfo = si),
    // ).subscribe({
    //   next: value => {
    //     this.supportingInfo = value;
    //     console.log(value)
    //   }
    // });
  }





}
