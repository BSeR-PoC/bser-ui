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

  constructor(
    private serviceRequestHandler: ServiceRequestHandlerService,
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private parameterHandlerService: ParameterHandlerService,
    private enginePostHandlerService: EnginePostHandlerService
) { }

  ngOnInit(): void {

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
      }
    });

    this.serviceRequestHandler.currentParameters$.subscribe(
      {
        next: (data: Parameters) => {
          this.currentParameters = data || new Parameters();
          //console.log("DATA:", data)
        },
        error: console.error
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
    if(stepNumber === 1){
      return !!this.selectedServiceProvider
    }
    else if (stepNumber === 2) {
      const collectedValues = ['race', 'ethnicity', 'educationLevel', 'employmentStatus', 'serviceType'];
      const currentParamsNames = this.currentParameters?.parameter?.map(param => param.name?.value?.toString());
      const result = collectedValues?.map(element => currentParamsNames?.indexOf(element) !== -1)
        .filter(element => element == false)
        .length === 0;
      return result;
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
        this.saveServiceRequest(this.currentSnapshot, this.currentParameters, advanceRequested);
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
                // We need to erase all parameters in this case.
                this.currentParameters.parameter = [];
                this.saveServiceRequest(this.currentSnapshot, this.currentParameters, advanceRequested);
              }
            }
          )
      }
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
    this.saveServiceRequest(this.currentSnapshot, this.currentParameters, advanceRequested);

  }

  //Saving the data from Step #3: Supporting Information
  onSaveSupportingInfo(event: any) {

    if(event.data?.height) {
      this.currentParameters = this.parameterHandlerService.setValueQuantityParameter(
        this.currentParameters, 'bodyHeight', event.data?.height?.value,
        event.data?.height?.unit, "http://unitsofmeasure.org", event.data?.height?.unit);
    }

    if(event.data?.weight) {
      this.currentParameters = this.parameterHandlerService.setValueQuantityParameter(
        this.currentParameters, 'bodyWeight', event.data?.weight?.value,
        event.data?.weight?.unit, "http://unitsofmeasure.org", event.data?.weight?.unit);
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
    this.saveServiceRequest(this.currentSnapshot, this.currentParameters, false);
    this.enginePostHandlerService.postToEngine(this.currentSnapshot, this.currentParameters);
    //TODO need to add allergies and medication history
  }

  private getServiceRequestById(serviceRequestId: any) {
    this.serviceRequestHandler.getServiceRequestById(serviceRequestId).subscribe({
      next: value => {
        this.serviceRequestHandler.currentSnapshot$.subscribe(
          {
            next: (data: ServiceRequest) => {
              const params = data.supportingInfo.find(element => element.type.value === "Parameters");
              if(params){
                const paramsId = params.reference.value.substring(params.reference.value.indexOf('/') + 1);
                if (paramsId){
                  this.serviceRequestHandler.getParametersById(paramsId).subscribe()
                }
              }
            },
            error: console.error
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
        error: console.error
      }
    );
  }

  saveServiceRequest(serviceRequest: ServiceRequest, currentParameters: Parameters, advanceRequested: boolean) {
    this.serviceRequestHandler.saveServiceRequest(serviceRequest, this.currentParameters).subscribe({
      next: value => {
        if (advanceRequested) {
          this.stepper.next();
        }
        this.utilsService.showSuccessNotification("The referral was saved successfully.");
      },
      error: err => console.error
    });
  }

  onServiceProviderSelected(serviceProvider: any) {
    this.selectedServiceProvider = serviceProvider;
  }

}

