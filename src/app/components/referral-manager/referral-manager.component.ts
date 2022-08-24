import {Component, OnInit, ViewChild} from '@angular/core';
import {ReferralService} from "../../service/referral.service";
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {MatStepper} from "@angular/material/stepper";
import {ActivatedRoute} from "@angular/router";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";

@Component({
  selector: 'app-referral-manager',
  templateUrl: './referral-manager.component.html',
  styleUrls: ['./referral-manager.component.scss']
})
export class ReferralManagerComponent implements OnInit {
  @ViewChild(MatStepper) stepper: MatStepper;

  referral: ServiceRequest;

  currentSnapshot: ServiceRequest;
  lastSnapshot: ServiceRequest;

  currentParameters: Parameters;
  lastParameters: Parameters;

  constructor(
    private referralService: ReferralService,
    private serviceRequestHandler: ServiceRequestHandlerService,
    private route: ActivatedRoute
) { }

  ngOnInit(): void {

    this.route.params.subscribe({
      next: params => {
        if(params && params['id']){
          this.getServiceRequestById(params['id']);
        }
        else {
          this.createNewServiceRequest();
        }
      }
    });

    this.serviceRequestHandler.currentParameters$.subscribe(
      {
        next: (data: any) => {
          this.currentParameters = data;
          console.log("DATA:", data)
        },
        error: console.error
      }
    );
  }

  isStepCompleted(stepNumber: number): boolean {
    return true;
  }

  onSaveProvider(event: any) {
    if(event?.data.step){
      this.stepper.next();
    }
    if(event?.data.selected && event?.data.serviceProviderId){
      this.serviceRequestHandler.setRecipient(this.currentSnapshot, event.data);
      this.saveServiceRequest(this.currentSnapshot);
    }
  }

  private getServiceRequestById(serviceRequestId: any) {
    console.log(serviceRequestId);
  }

  private createNewServiceRequest() {
    this.serviceRequestHandler.createNewServiceRequest();
    this.serviceRequestHandler.currentSnapshot$.subscribe(
      {
        next: (data: any) => {
          this.currentSnapshot = data;
          console.log("DATA:", data)
        },
        error: console.error
      }
    );
  }

  saveServiceRequest(serviceRequest: ServiceRequest) {
    this.serviceRequestHandler.saveServiceRequest(serviceRequest).subscribe(
      {
        next: (data: any) => {
          this.lastSnapshot = this.serviceRequestHandler.deepCopy(data);
          this.currentSnapshot = this.serviceRequestHandler.deepCopy(data);
        },
        error: console.error
      }
    );
  }


}

