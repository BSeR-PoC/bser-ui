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
import {MatDialog} from "@angular/material/dialog";
import {ParameterHandlerService} from "../../service/parameter-handler.service";
import {EnginePostHandlerService} from "../../service/engine-post-handler.service";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";
import {timeout} from "rxjs";

@Component({
  selector: 'app-referral-manager',
  templateUrl: './referral-manager.component.html',
  styleUrls: ['./referral-manager.component.scss']
})
export class ReferralManagerComponent implements OnInit {
  @ViewChild(MatStepper) stepper: MatStepper;

  currentSnapshot: ServiceRequest;

  currentParameters: Parameters;

  selectedServiceProvider: Practitioner;

  isLoading: boolean = false;

  completedSteps = new Set<number>();

  stepsEnabled: boolean;

  constructor(
    private serviceRequestHandler: ServiceRequestHandlerService,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private parameterHandlerService: ParameterHandlerService,
    private enginePostHandlerService: EnginePostHandlerService
) { }

  ngOnInit(): void {
    this.completedSteps = new Set<number>();
    this.route.params.subscribe({
      next: params => {
        if(params && params['id']){
          this.getServiceRequestById(params['id']);
          // TODO: Make HTTP Call for ServiceRequest.supportingInfo[0].reference
          // GET cqf-ruler/fhir/Parameters/09d02cfa-48ef-4a8d-9875-a2870a54f728
        }
        else {
          this.createNewServiceRequest();
        }
      },
      error: err => this.utilsService.showErrorNotification(err?.message?.toString())
    });

    this.serviceRequestHandler.currentParameters$.subscribe(
      {
        next: (data: Parameters) => {
          this.currentParameters = data || new Parameters();
          //console.log("DATA:", data)
        },
        error: err => this.utilsService.showErrorNotification(err?.message?.toString())
      }
    );

    this.serviceRequestHandler.currentSnapshot$.subscribe(
      {
        next: (data: ServiceRequest) => {
          this.currentSnapshot = data
        },
        error: console.error
      }
    );


    //TODO We should keep track of the completed steps and initialize them after we get the parameters resource.
  }

  isStepCompleted(stepNumber: number): boolean {
    const  paramNames = this.currentParameters?.parameter?.map(param => param.name.toJSON().value);
    if(stepNumber === 1){
      return this.completedSteps.has(1);
      // const result = !!this.selectedServiceProvider;
      // if(result){
      //   completedSteps.add(1);
      // }
      // return result;
    }
    else if (stepNumber === 2) {
      //const requiredParamsStep2 = ['race', 'ethnicity', 'educationLevel', 'employmentStatus', 'serviceType'];
      // if(!paramNames ||  paramNames.length < requiredParamsStep2.length){
      //   return false;
      // }
      // const result = paramNames.filter(element => requiredParamsStep2.indexOf(element) != -1).length == requiredParamsStep2.length;
      // if(result){
      //   completedSteps.add(2);
      // }
      // return result;
      return this.completedSteps.has(2);
    }
    else if (stepNumber === 3) {
      // const requiredParamsStep3 = ['bodyHeight', 'bodyWeight', 'bmi', 'bloodPressure'];
      // if(!paramNames ||  paramNames.length < requiredParamsStep3.length){
      //   return false;
      // }
      // const result =  paramNames.filter(element => requiredParamsStep3.indexOf(element) != -1).length == requiredParamsStep3.length;
      // if(result){
      //   completedSteps.add(3);
      // }
      // return result;
      return this.completedSteps.has(3);
    }
    else if (stepNumber === 4) {
      return this.completedSteps.has(4);
    }
    else {
      return false;
    }
  }

  //Handles the first step of the form (Selecting a service provider).
  onSaveProvider(event: any) {
    const advanceRequested = event.advanceRequested;
    const selectedServiceProvider = event.data;

    if(selectedServiceProvider.selected && selectedServiceProvider.serviceProviderId){
      const serviceRequestService = this.currentSnapshot?.orderDetail?.[0]?.coding?.[0]?.code?.value;
      const selectedServiceProviderServices = selectedServiceProvider?.services?.serviceType;

      if(!serviceRequestService
          ||
        selectedServiceProviderServices.indexOf(serviceRequestService) != -1
      ){
        this.serviceRequestHandler.setRecipient(this.currentSnapshot, selectedServiceProvider);
        this.saveServiceRequest(this.currentSnapshot, this.currentParameters, advanceRequested, 1);
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
                this.currentSnapshot.orderDetail = null;
                this.serviceRequestHandler.setRecipient(this.currentSnapshot, selectedServiceProvider);
                this.currentParameters.parameter.length = 0;
                this.saveServiceRequest(this.currentSnapshot, this.currentParameters, advanceRequested, 1);
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

    const advanceRequested = event.advanceRequested;

    if(event.data?.serviceType){
      let coding = new Coding({code: event.data?.serviceType?.code, display : event.data?.serviceType?.display});
      let codeableConcept = new CodeableConcept({coding: [coding], text: event.data?.serviceType?.display});

      this.serviceRequestHandler.setServiceTypePlamen(this.currentSnapshot, codeableConcept);
     // this.saveServiceRequest(this.currentSnapshot, advanceRequested);

      if (event.data?.serviceType){
        this.currentParameters = this.parameterHandlerService
          .setCodeParameter(this.currentParameters, 'serviceType', event.data?.serviceType?.code);
      }
    }

    if(event.data?.educationLevel?.code) {
      this.currentParameters = this.parameterHandlerService
        .setCodeParameter(this.currentParameters, 'educationLevel', event.data?.educationLevel?.code);
    }

    if(event.data?.employmentStatus?.code) {
      this.currentParameters = this.parameterHandlerService
        .setCodeParameter(this.currentParameters, 'employmentStatus', event.data?.employmentStatus?.code);
    }

    if(event.data?.ethnicity) {
      this.currentParameters = this.parameterHandlerService
        .setCodeParameter(this.currentParameters, 'ethnicity', event.data?.ethnicity?.code);
    }

    if(event.data?.race){
      const raceStr = event.data?.race?.map(element => element.code).toString();
      this.currentParameters = this.parameterHandlerService
        .setCodeParameter(this.currentParameters, 'race', raceStr);
    }
    //TODO not sure if we need this method since we already have a parameterHandlerService
    //this.serviceRequestHandler.updateParams(this.currentParameters);
    this.saveServiceRequest(this.currentSnapshot, this.currentParameters, advanceRequested, 2);

  }

  //Saving the data from Step #3: Supporting Information
  onSaveSupportingInfo(event: any) {
    const advanceRequested = event.advanceRequested;

    if(event.data?.height) {
      this.currentParameters = this.parameterHandlerService.setValueQuantityParameter(
        this.currentParameters, 'bodyHeight', event.data?.height?.value,
        event.data?.height?.unit?.display, "http://unitsofmeasure.org", event.data?.height?.unit?.code);
    }

    if(event.data?.weight) {
      this.currentParameters = this.parameterHandlerService.setValueQuantityParameter(
        this.currentParameters, 'bodyWeight', event.data?.weight?.value,
        event.data?.weight?.unit?.display, "http://unitsofmeasure.org", event.data?.weight?.unit?.code);
    }

    if(event.data?.bmi) {
      this.currentParameters = this.parameterHandlerService.setValueQuantityParameter(
        this.currentParameters, 'bmi', event.data?.bmi?.value,
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

      this.currentParameters = this.parameterHandlerService.setPartParameter(this.currentParameters,'bloodPressure', partArray);
    }

    if(event.data?.ha1c) {
      this.currentParameters = this.parameterHandlerService.setValueQuantityParameter(
        this.currentParameters, 'ha1c', event.data?.ha1c?.value,
        event.data?.ha1c?.unit, "http://unitsofmeasure.org", event.data?.ha1c?.unit);
    }

    this.saveServiceRequest(this.currentSnapshot, this.currentParameters, advanceRequested, 3);
    this.enginePostHandlerService.postToEngine(this.currentSnapshot, this.currentParameters).subscribe({
      next: () => this.completedSteps.add(4)
    });
    //TODO need to add allergies and medication history
  }

  // TODO refactor nested subscriptions
  private getServiceRequestById(serviceRequestId: any) {
    this.isLoading = true;
    this.serviceRequestHandler.getServiceRequestById(serviceRequestId).subscribe({
      next: value => {
        this.serviceRequestHandler.currentSnapshot$.subscribe(
          {
            next: (data: ServiceRequest) => {
              this.isLoading = false;
              const params = data.supportingInfo.find(element => element.type?.value === "Parameters");
              if(params){
                const paramsId = params.reference.value.substring(params.reference.value.indexOf('/') + 1);
                if (paramsId){
                  this.serviceRequestHandler.getParametersById(paramsId).subscribe()
                }
              }
            },
            error: err => this.utilsService.showErrorNotification(err?.message?.toString())
          }
        );
      }
    });
  }

  private createNewServiceRequest() {
    this.serviceRequestHandler.createNewServiceRequest();
    this.serviceRequestHandler.currentSnapshot$.subscribe(
      {
        next: (data: ServiceRequest) => {
          this.currentSnapshot = data;
          console.log("DATA:", data)
        },
        error: err => this.utilsService.showErrorNotification(err?.message?.toString())
      }
    );
  }

  saveServiceRequest(serviceRequest: ServiceRequest, currentParameters: Parameters, advanceRequested: boolean, step) {
    this.isLoading = true;
    this.serviceRequestHandler.saveServiceRequest(serviceRequest, this.currentParameters).subscribe({
      next: value => {
        this.completedSteps.add(step);
        this.isLoading = false;
        if (advanceRequested) {
          //We need additional cycle for the stepper, or it will not advance
          setTimeout(()=> this.stepper.next())
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
    // 1. Temporary set the returnToPreviousRequested to true
    // 2. Return a step (we need the timeout to keep the stepper enabled)
    // 3. Remove the last completed step. This way the user cannot advance the stepper directly from the header.
    this.stepsEnabled = true;
    let operation = '';
    if(step === 1){
      setTimeout(()=> {
        if (step === 1) {
          this.stepper.reset();
          this.completedSteps = new Set<number>();
          this.stepsEnabled = false;
        }
      });
    }
    else if (this.completedSteps.has(step)){
      this.completedSteps.delete(step);
      setTimeout(() => {
        this.stepper.previous();
        this.stepsEnabled = false;
      });
    }
    else {
      this.completedSteps.add(step-1);
      setTimeout(() => {
        this.stepper.next();
        this.stepsEnabled = false;
      });
    }
    // }
    // }
    // this.returnToPreviousRequested = true;
    // setTimeout(()=> {
    //   if(step === 1){
    //     this.stepper.reset();
    //     this.completedSteps = new Set<number>()
    //   }
    //   else if(this.completedSteps.has(step)) {
    //     this.stepper.previous();
    //     this.returnToPreviousRequested = false;
    //     this.completedSteps.delete(step);
    //   }
    //   else {
    //     this.completedSteps.add(step);
    //     this.stepper.next();
    //   }
    // });

  }
}


