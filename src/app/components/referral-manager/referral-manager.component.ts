import {Component, OnInit, ViewChild} from '@angular/core';
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {MatStepper} from "@angular/material/stepper";
import {ActivatedRoute} from "@angular/router";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {UtilsService} from "../../service/utils.service";
import {Coding} from "@fhir-typescript/r4-core/dist/fhir/Coding";
import {CodeableConcept} from "@fhir-typescript/r4-core/dist/fhir/CodeableConcept";
import {openConformationDialog} from "../conformation-dialog/conformation-dialog.component";
import {ParameterHandlerService} from "../../service/parameter-handler.service";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";
import {MatDialog} from "@angular/material/dialog";
import {mergeMap, of, take, tap} from "rxjs";

@Component({
    selector: 'app-referral-manager',
    templateUrl: './referral-manager.component.html',
    styleUrls: ['./referral-manager.component.scss'],
    standalone: false
})
export class ReferralManagerComponent implements OnInit {
  @ViewChild(MatStepper) stepper: MatStepper;

  serviceRequest: ServiceRequest;

  parameters: Parameters;

  selectedServiceProvider: Practitioner;

  isLoading: boolean = false;

  completedSteps = new Set<number>();

  stepsEnabled: boolean;

  constructor(
    private serviceRequestHandler: ServiceRequestHandlerService,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private parameterHandlerService: ParameterHandlerService) { }

  ngOnInit(): void {
    this.completedSteps = new Set<number>();
    this.route.params.subscribe({
      next: params => {
        if(params && params['id']){
          this.getServiceRequestById(params['id']);
        }
        else {
          this.createNewServiceRequest();
        }
      },
      error: err => this.utilsService.showErrorNotification(err?.message?.toString())
    });
  }

  isStepCompleted(stepNumber: number): boolean {
   return this.completedSteps.has(stepNumber);
  }

  // Handles the first step of the form (Selecting a service provider).
  onSaveProvider(event: any) {
    const requestedStep = event.requestedStep;
    const selectedServiceProvider = event.data;

    if(selectedServiceProvider.selected && selectedServiceProvider.serviceProviderId){
      const serviceRequestService = this.serviceRequest?.orderDetail?.[0]?.coding?.[0]?.code?.value;
      const selectedServiceProviderServices = selectedServiceProvider?.services?.serviceType;

      if(!serviceRequestService
          ||
        selectedServiceProviderServices.indexOf(serviceRequestService) != -1
      ){
        this.serviceRequestHandler.setRecipient(this.serviceRequest, selectedServiceProvider);
        this.saveServiceRequest(this.serviceRequest, this.parameters, requestedStep);
      }
      else {
        // the selected service provider does not offer the service in the existing service request.
        openConformationDialog(
          this.dialog,
          {
            title: "Service not Performed by Provider",
            content: `${this.getPractitionerNameAndOrg(this.selectedServiceProvider)}
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
                this.serviceRequest.orderDetail = null;
                this.serviceRequestHandler.setRecipient(this.serviceRequest, selectedServiceProvider);
                this.parameters.parameter.length = 0;
                this.saveServiceRequest(this.serviceRequest, this.parameters, requestedStep);
              }
            }
          )
      }
    }
  }

  private getPractitionerNameAndOrg(selectedServiceProvider): string {
    if(selectedServiceProvider?.practitioner?.familyName){
      return selectedServiceProvider?.practitioner?.familyName + ' (' + selectedServiceProvider?.organization?.name + ')';
    }
    else {
      return selectedServiceProvider?.organization?.name
    }
  }

  //Saving the data from Step #2: General Information and Service Type in the stepper
  onSaveGeneralInfoAndServiceType(event: any){

    const requestedStep = event.requestedStep;

    if(event.data?.serviceType){
      let coding = new Coding({code: event.data?.serviceType?.code, display : event.data?.serviceType?.display});
      let codeableConcept = new CodeableConcept({coding: [coding], text: event.data?.serviceType?.display});

      this.serviceRequestHandler.setServiceType(this.serviceRequest, codeableConcept);
     // this.saveServiceRequest(this.currentSnapshot, advanceRequested);

      if (event.data?.serviceType){
        this.parameters = this.parameterHandlerService
          .setCodeParameter(this.parameters, 'serviceType', event.data?.serviceType?.code);
      }
    }

    if(event.data?.educationLevel?.code) {
      this.parameters = this.parameterHandlerService
        .setCodeParameter(this.parameters, 'educationLevel', event.data?.educationLevel?.code);
    }

    if(event.data?.employmentStatus?.code) {
      this.parameters = this.parameterHandlerService
        .setCodeParameter(this.parameters, 'employmentStatus', event.data?.employmentStatus?.code);
    }

    if(event.data?.ethnicity) {
      this.parameters = this.parameterHandlerService
        .setCodeParameter(this.parameters, 'ethnicity', event.data?.ethnicity?.code);
    }

    if(event.data?.race){
      const raceStr = event.data?.race?.map(element => element.code).toString();
      this.parameters = this.parameterHandlerService
        .setCodeParameter(this.parameters, 'race', raceStr);
    }
    this.saveServiceRequest(this.serviceRequest, this.parameters, requestedStep);
  }

  // Saving the data from Step #3: Supporting Information
  onSaveSupportingInfo(event: any) {
    const requestedStep = event.requestedStep;

    if(event.data?.height) {
      this.parameters = this.parameterHandlerService.setValueQuantityParameter(
        this.parameters, 'bodyHeight', event.data?.height?.value,
        event.data?.height?.unit?.display, "http://unitsofmeasure.org", event.data?.height?.unit?.code);
    }
    if(event.data?.weight) {
      this.parameters = this.parameterHandlerService.setValueQuantityParameter(
        this.parameters, 'bodyWeight', event.data?.weight?.value,
        event.data?.weight?.unit?.display, "http://unitsofmeasure.org", event.data?.weight?.unit?.code);
    }
    if(event.data?.bmi) {
      this.parameters = this.parameterHandlerService.setValueQuantityParameter(
        this.parameters, 'bmi', event.data?.bmi?.value,
        event.data?.bmi?.unit, "http://unitsofmeasure.org", event.data?.bmi?.unit);
    }
    if(event.data?.bp){
      const partArray = [
        {
          name: "diastolic",
          valueQuantity: {
            value: event.data?.bp?.bpDiastolic?.value,
            unit: "mmHg",
            system: "http://unitsofmeasure.org",
            code: "mm[Hg]"
          }
        },
        {
          name: "systolic",
          valueQuantity: {
            value: event.data?.bp?.bpSystolic?.value,
            unit: "mmHg",
            system: "http://unitsofmeasure.org",
            code: "mm[Hg]"
          }
        },
        {
          name: "date",
          valueDateTime: new Date()
        }
      ];

      this.parameters = this.parameterHandlerService.setPartParameter(this.parameters,'bloodPressure', partArray);
    }

    if(event.data?.ha1c) {
      this.parameters = this.parameterHandlerService.setValueQuantityParameter(
        this.parameters, 'ha1c', event.data?.ha1c?.value,
        event.data?.ha1c?.unit, "http://unitsofmeasure.org", event.data?.ha1c?.unit);
    }

    this.saveServiceRequest(this.serviceRequest, this.parameters, requestedStep);
  }

  // TODO refactored nested subscription, but the serviceRequestHandler needs total refactoring with nested subscriptions removed
  private getServiceRequestById(serviceRequestId: any) {
    this.isLoading = true;
    this.serviceRequestHandler.getServiceRequestById(serviceRequestId).pipe(
      mergeMap( (value: any) => {
        this.serviceRequest = value as ServiceRequest;
        const params = this.serviceRequest.supportingInfo.find(element => {
          console.log(element);
          return element.type.toString() == "Parameters";
        });
        if (params) {
          const paramsId = params.reference.substring(params.reference.indexOf('/') + 1);
          return this.serviceRequestHandler.getParametersById(paramsId); // Return observable for parameters
        }
        return of(null);
      }),
     // take(1), // we don't want to generate multiple subscriptions every time we call getServiceRequestById
    ).subscribe({
      next: value => {
        this.parameters = new Parameters(value);
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.utilsService.showErrorNotification("Server error retrieving results from API!")
        this.utilsService.showErrorNotification(err?.message?.toString())
      }
    })
  }

  private createNewServiceRequest() {
    this.serviceRequestHandler.createNewServiceRequest().subscribe({
      next: value => {
        this.serviceRequest = value.currentSnapshot;
        this.parameters = value.currentParameters;
      }
    });
  }

  saveServiceRequest(serviceRequest: ServiceRequest, currentParameters: Parameters, requestedStep: number) {
    this.isLoading = true;
    this.serviceRequestHandler.saveServiceRequest(serviceRequest, this.parameters).subscribe({
      next: value => {
        const serviceRequestEntry =  value?.entry?.find(entry => entry.response.location.indexOf("ServiceRequest") != -1);
        const regex = /ServiceRequest\/(\d+)\//;
        const serviceRequestId = regex.exec(serviceRequestEntry?.response?.location)?.[1];
        this.getServiceRequestById(serviceRequestId);
        this.isLoading = false;
        if(requestedStep){
          this.onRequestStep(requestedStep);
        }
        this.utilsService.showSuccessNotification("The referral was saved successfully.");
      },
      error: err => {
        this.isLoading = false;
        this.utilsService.showErrorNotification(err?.message?.toString());
      }
    });
  }

  onServiceProviderSelected(serviceProvider: any) {
    this.selectedServiceProvider = serviceProvider;
  }

  onRequestStep(step: number){
    // Temporary set the returnToPreviousRequested to true. This will enable the stepper to switch between steps.
    // Reset this value ONLY AFTER the stepper operation (advance or return) is complete.
    this.stepsEnabled = true;

    if(step === 1){
      // If the first step is requested, we need to clear the completed steps set, and reset the stepper.
      // Resetting the stepper, automatically goes back to step1
      setTimeout(()=> {
        if (step === 1) {
          this.stepper.reset();
          this.completedSteps = new Set<number>();
          this.stepsEnabled = false;
        }
      });
    }
    else if (this.completedSteps.has(step)){
      // If the requested step is already completed, the only logical operation is return to previous step.
      this.completedSteps.delete(step);
      setTimeout(() => {
        this.stepper.previous();
        this.stepsEnabled = false;
      });
    }
    else {
      // If the requested has not been completed, the only logical operation is advance to the next step.
      this.completedSteps.add(step-1);
      setTimeout(() => {
        this.stepper.next();
        this.stepsEnabled = false;
      });
    }
  }
}


