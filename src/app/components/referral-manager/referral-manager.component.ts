import {Component, OnInit, ViewChild} from '@angular/core';
import {ReferralService} from "../../service/referral.service";
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {MatStepper} from "@angular/material/stepper";
import {ActivatedRoute} from "@angular/router";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {UtilsService} from "../../service/utils.service";
import {Coding} from "@fhir-typescript/r4-core/dist/fhir/Coding";
import {CodeableConcept} from "@fhir-typescript/r4-core/dist/fhir/CodeableConcept";
import {openConformationDialog} from "../conformation-dialog/conformation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-referral-manager',
  templateUrl: './referral-manager.component.html',
  styleUrls: ['./referral-manager.component.scss']
})
export class ReferralManagerComponent implements OnInit {
  @ViewChild(MatStepper) stepper: MatStepper;

  serviceRequest: ServiceRequest;

  currentSnapshot: ServiceRequest;
  lastSnapshot: ServiceRequest;

  currentParameters: Parameters;
  lastParameters: Parameters;

  selectedServiceProvider: any;

  constructor(
    private referralService: ReferralService,
    private serviceRequestHandler: ServiceRequestHandlerService,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private dialog: MatDialog,
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
    let advanceRequested = false;
    const selectedServiceProvider = event.data;
    if(event?.step){
      advanceRequested = true;
    }
    if(selectedServiceProvider.selected && selectedServiceProvider.serviceProviderId){
      const serviceRequestService = this.currentSnapshot?.orderDetail?.[0]?.coding?.[0]?.code;
      const selectedServiceProviderServices = selectedServiceProvider?.services?.serviceType;

      if(!serviceRequestService
          ||
        selectedServiceProviderServices.indexOf(serviceRequestService) != -1
      ){
        this.serviceRequestHandler.setRecipient(this.currentSnapshot, selectedServiceProvider);
        this.saveServiceRequest(this.currentSnapshot, advanceRequested);
      }
      else {
        // the selected service provider does not offer the service in the existing service request.
          openConformationDialog(
            this.dialog,
            {
              title: "Service not Performed by Provider",
              content: `${selectedServiceProvider?.practitioner?.familyName} (${selectedServiceProvider?.organization?.name})
                does not provide the previously selected service type, ${serviceRequestService}.
                Proceeding with this selection will discard other referral information.`,
              defaultActionBtnTitle: "Cancel",
              secondaryActionBtnTitle: "Change Service Provider",
              width: "38em",
              height: "15em"
            })
            .subscribe(
              action => {
                if (action == 'secondaryAction') {
                  this.currentSnapshot.orderDetail = null;
                  this.serviceRequestHandler.setRecipient(this.currentSnapshot, selectedServiceProvider);
                  this.saveServiceRequest(this.currentSnapshot, advanceRequested);
                }
              }
            )
        }
    }
  }

  onSaveGeneralInfoAndServiceType(event: any){
    let advanceRequested = false;
    if(event?.step){
      advanceRequested = true;
    }
    if(event?.data?.serviceType){
      let coding = new Coding({code: event.data?.serviceType?.code, display : event.data?.serviceType?.display});
      let codeableConcept = new CodeableConcept({coding: [coding], text: event.data?.serviceType?.display});

      this.serviceRequestHandler.setServiceTypePlamen(this.currentSnapshot, codeableConcept);
      this.saveServiceRequest(this.currentSnapshot, advanceRequested);
    }
  }

  private getServiceRequestById(serviceRequestId: any) {
    this.serviceRequestHandler.getServiceRequestById(serviceRequestId).subscribe({
      next: value => {
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
    })
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

  saveServiceRequest(serviceRequest: ServiceRequest, advanceRequested: boolean) {
    console.log(serviceRequest);
    this.serviceRequestHandler.saveServiceRequest(serviceRequest).subscribe(
      {
        next: (data: any) => {
          this.lastSnapshot = this.serviceRequestHandler.deepCopy(data);
          this.currentSnapshot = this.serviceRequestHandler.deepCopy(data);
          if(advanceRequested) {
            this.stepper.next();
          }
          this.utilsService.showSuccessNotification("The referral was saved successfully.");
        },
        error: (data => {
          console.error(data);
          // TODO we need to render the error in an error message widget.
        })
      }
    );
  }


  onServiceProviderSelected(serviceProvider: any) {
    this.selectedServiceProvider = serviceProvider;
  }
}

