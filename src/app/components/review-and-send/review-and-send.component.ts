import {Component, Input, OnInit} from '@angular/core';
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";

@Component({
  selector: 'app-review-and-send',
  templateUrl: './review-and-send.component.html',
  styleUrls: ['./review-and-send.component.scss']
})
export class ReviewAndSendComponent implements OnInit {

  @Input() selectedServiceProvider: any;

  currentSnapshot: ServiceRequest;

  currentParameters: Parameters;

  constructor(
    private serviceRequestHandlerService: ServiceRequestHandlerService
  ) { }

  ngOnInit(): void {
    this.serviceRequestHandlerService.currentParameters$.subscribe(
      {
        next: (data: Parameters) => {
          this.currentParameters = data || new Parameters();
          //console.log("DATA:", data)
        },
        error: console.error
      }
    );

    this.serviceRequestHandlerService.currentSnapshot$.subscribe(
      {
        next: (data: ServiceRequest) => {
          this.currentSnapshot = data
        },
        error: console.error
      }
    );
  }

  onCancel() {
    console.log("on cancel send");
  }

  onSendReferral() {
    console.log("on send referral");
  }
}
