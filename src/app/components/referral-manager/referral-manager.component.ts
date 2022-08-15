import {Component, OnInit, ViewChild} from '@angular/core';
import {ReferralService} from "../../service/referral.service";
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {MatStepper} from "@angular/material/stepper";

@Component({
  selector: 'app-referral-manager',
  templateUrl: './referral-manager.component.html',
  styleUrls: ['./referral-manager.component.scss']
})
export class ReferralManagerComponent implements OnInit {
  @ViewChild(MatStepper) stepper: MatStepper;

  referral: ServiceRequest;
  originalReferral: ServiceRequest;

  constructor(
    referralService: ReferralService,
  ) { }

  ngOnInit(): void {
    //TODO Get the current referral if the operation is update
    //TODO Make a copy of the current referral it and store it in the originalReferral variable
  }

  isStepCompleted(stepNumber: number): boolean {
    return true;
  }

  onSaveProvider(event: any) {
    if(event.step){
      this.stepper.next();
    }
    //TODO refresh the referral( we can pass it as an event property or we can make a getReferral call here).
  }
}

