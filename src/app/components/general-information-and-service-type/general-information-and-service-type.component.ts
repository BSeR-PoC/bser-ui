import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";
import {Router} from "@angular/router";
import {FhirClientService} from "../../service/fhir-client.service";
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {USCorePatient} from "../../domain/USCorePatient";
import {openConformationDialog} from "../conformation-dialog/conformation-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";

const CURRENT_STEP = 2;

@Component({
  selector: 'app-general-information-and-service-type',
  templateUrl: './general-information-and-service-type.component.html',
  styleUrls: ['./general-information-and-service-type.component.scss']
})

export class GeneralInformationAndServiceTypeComponent implements OnInit {

  // Multiple checkbox reactive form solution inspired by:
  // https://stackblitz.com/edit/multi-checkbox-form-control-angular7

  @Input() selectedServiceProvider: any;

  @Output() savedSuccessEvent = new EventEmitter();
  @Output() requestStepEvent = new EventEmitter();

  generalInfoServiceTypeForm: FormGroup;
  usCorePatient: USCorePatient;
  serviceRequest: ServiceRequest;
  parameters: Parameters;
  initialFormValue: any;

  constructor(
    public fhirConstants: FhirTerminologyConstants,
    private router: Router,
    private fhirClient: FhirClientService,
    private dialog: MatDialog,
    private serviceRequestHandlerService: ServiceRequestHandlerService
  ) {
  }

  ngOnInit(): void {
    this.generalInfoServiceTypeForm = new FormGroup({
      serviceType: new FormControl(null, [Validators.required]),
      raceCategoriesListCheckboxes: this.createRaceCategoryControls(this.fhirConstants.RACE_CATEGORIES.slice(0, 5)),
      raceCategoriesListRadioBtns: new FormControl(),
      educationLevel: new FormControl(null, [Validators.required]),
      employmentStatus: new FormControl(null, [Validators.required]),
      ethnicity: new FormControl(null, [Validators.required])
    });

    this.fhirClient.getPatient().subscribe({
      next: (result) => {
        const patient = Object.assign(new Patient(), result);
        this.usCorePatient = new USCorePatient(patient);
        this.updateFormControlsWithPatientValues(this.usCorePatient);
        this.initialFormValue = this.serviceRequestHandlerService.deepCopy(this.generalInfoServiceTypeForm.value);
      }
    });

    this.serviceRequestHandlerService.currentSnapshot$.subscribe({
        next: (value: ServiceRequest) => {
          this.serviceRequest = value;
          const serviceCode = this.fhirConstants.SERVICE_TYPES
            .find(serviceType => serviceType.code === this.serviceRequest?.orderDetail?.[0]?.coding?.[0]?.code.toString());
          if (serviceCode) {
            this.generalInfoServiceTypeForm.controls['serviceType'].patchValue(serviceCode);
          }
        }
      }
    )

    this.serviceRequestHandlerService.currentParameters$.subscribe({
        next: (value: Parameters)=> {
          this.parameters = value;
          if(this.parameters?.parameter?.length > 0){
            this.updateFormControlsWithParamsValues(this.parameters);
            this.initialFormValue = this.serviceRequestHandlerService.deepCopy(this.generalInfoServiceTypeForm.value);
          }
        }
      }
    )
  }

  /**
  * 1. We only load data from the Patient if the data is not populated by the params.
  * This will be in the case we are creating a new service request.
  * 2. We only load data for race and ethnicity.
   */
  private updateFormControlsWithPatientValues(usCorePatient) {

    if(usCorePatient.ethnicity && !this.parameters?.parameter?.find( param=> param.name.toString() === "ethnicity")){

      const ethnicity = this.fhirConstants.ETHNICITY
        .find((element) => element.code === usCorePatient.ethnicity[0]?.valueCoding?.code);

      this.generalInfoServiceTypeForm.controls['ethnicity'].patchValue(ethnicity);
    }

    if(usCorePatient.race && !this.parameters?.parameter?.find( param=> param.name.toString() === "race")){

      // Populating the checkboxes first.
      const raceCodes = usCorePatient.race.map(element => element.valueCoding?.code);
      const raceCheckboxesSelectedList = this.fhirConstants.RACE_CATEGORIES
        .slice(0, 5)
        .map(element => element.code)
        .map((element) => raceCodes?.indexOf(element) != -1);

      this.generalInfoServiceTypeForm.controls['raceCategoriesListCheckboxes'].patchValue(raceCheckboxesSelectedList);

      //Populating the radio buttons second (Only populated if there is no checkboxes selected)
      if(!raceCheckboxesSelectedList.find(element => element === true)){
        const raceRadioBtnValue = this.fhirConstants.RACE_CATEGORIES
          .slice(5)
          .find(element => element.code === raceCodes[0]);
        this.generalInfoServiceTypeForm.controls['raceCategoriesListRadioBtns'].patchValue(raceRadioBtnValue);
      }
    }
  }

  private createRaceCategoryControls(raceCategories) {
    const arr = raceCategories.map(category => {
      return new FormControl(category.selected || false);
    });
    return new FormArray(arr);
  }

  /**
   * When the user selects any of the checkboxes for the race, we want to deselect the radio buttons.
   * This is because we cannot have a selected race value and simultaneously
   * selected Unknown or Asked but no answer value selected.
   */
  onRaceCategoryCheckboxChange(event: any) {
    const raceSelected = this.generalInfoServiceTypeForm
      .get("raceCategoriesListCheckboxes")
      .value
      .find(item => !!item);
    if (raceSelected) {
      this.generalInfoServiceTypeForm.patchValue({
        raceCategoriesListRadioBtns: null,
      });
    }
  }

  /**
   * When the user selects any of the radio buttons for the race, we want to deselect the checkboxes.
   * This is because we cannot have a selected Unknown or Asked but no answer radio selected  and simultaneously
   * selected known value for Race.
   */
  onRaceCategoryRadioBtnChange(event: any) {
    this.generalInfoServiceTypeForm
      .controls['raceCategoriesListCheckboxes']['controls']
      .forEach(control => control.patchValue(false));
  }

  isRaceSelected() {
    if (this.generalInfoServiceTypeForm
        .get("raceCategoriesListCheckboxes")
        .value
        .find(item => !!item)
      ||
      this.generalInfoServiceTypeForm
        .get("raceCategoriesListRadioBtns")
        .value
    ) {
      return true;
    } else {
      return false;
    }
  }

  isControlValid(controlName: string, errorCode: string): boolean {
    return this.generalInfoServiceTypeForm.get(controlName).hasError(errorCode)
      && this.generalInfoServiceTypeForm.get(controlName).touched;
  };

  onCancel() {
    if(this.serviceRequestHandlerService.deepCompare(this.generalInfoServiceTypeForm.value, this.initialFormValue)){
      this.router.navigate(['/']);
    }
    else {
      openConformationDialog(
        this.dialog,
        {
          title: "Save Changes",
          content: "Save your current changes?",
          defaultActionBtnTitle: "Save",
          secondaryActionBtnTitle: "Cancel",
          width: "20em",
          height: "12em"
        })
        .subscribe(
          action => {
            if (action == 'secondaryAction') {
              this.router.navigate(['/']);
            }
            else if (action == 'defaultAction') {
              this.onSave(CURRENT_STEP + 1);
            }
          }
        )
    }
  }

  onSave(requestedStep?: number) {
    this.generalInfoServiceTypeForm.markAllAsTouched();
    if(this.generalInfoServiceTypeForm.status === 'VALID') {
      const formData = this.getFormData(this.generalInfoServiceTypeForm);
      this.savedSuccessEvent.emit({ requestedStep: requestedStep, data: formData });
    }
  }

  getServices(selectedServiceProvider: any) {
    if(!selectedServiceProvider || !selectedServiceProvider.services?.serviceType?.length){
      return null
    }
    const result = this.fhirConstants.SERVICE_TYPES.filter(
      service => selectedServiceProvider.services.serviceType.indexOf(service.code) != -1
    );
    return result;
  }

  private getRaceFromFormControls(form): any{

    // First check if any of the race checkboxes are selected and map the selection to race categories
    const raceCategories = this.fhirConstants.RACE_CATEGORIES.slice(0, 5)
    const raceCheckBoxesResult = form.controls['raceCategoriesListCheckboxes']
      .value
      .map((controlSelected, index) => {if(controlSelected) return index})
      .filter(element => !!element)
      .map(index => raceCategories[index]);

    if(raceCheckBoxesResult.length){
      return raceCheckBoxesResult
    }

    //If no checkbox is selected return the results from the radio buttons selection
    return [form.controls['raceCategoriesListRadioBtns'].value];
  }

  private getFormData(generalInfoServiceTypeForm: FormGroup) {

    const serviceType = generalInfoServiceTypeForm.controls['serviceType'].value;
    const educationLevel = generalInfoServiceTypeForm.controls['educationLevel'].value;
    const employmentStatus = generalInfoServiceTypeForm.controls['employmentStatus'].value;
    const ethnicity = generalInfoServiceTypeForm.controls['ethnicity'].value;
    const race = this.getRaceFromFormControls(generalInfoServiceTypeForm);

    const emitterData = {
      serviceType: serviceType,
      educationLevel: educationLevel,
      employmentStatus: employmentStatus,
      ethnicity: ethnicity,
      race: race
    }

    return emitterData;
  }

  private updateFormControlsWithParamsValues(parameters: Parameters) {
    let educationLevelParam = parameters.parameter.find(param => param.name.value == 'educationLevel');
    const educationLevel = this.fhirConstants.EDUCATION_LEVEL.find(element => element.code === educationLevelParam?.value?.toString());
    if (educationLevel) {
      this.generalInfoServiceTypeForm.controls['educationLevel'].patchValue(educationLevel);
    }

    // Set Employment Status
    const employmentStatusParam = parameters.parameter?.find(param => param.name.value == 'employmentStatus');
    const employmentStatus = this.fhirConstants.EMPLOYMENT_STATUS.find(element => element.code === employmentStatusParam?.value?.toString());
    if (employmentStatus) {
      this.generalInfoServiceTypeForm.controls['employmentStatus'].patchValue(employmentStatus);
    }

    // Set Service Type
    const serviceTypeParam = parameters.parameter?.find(param => param.name.value == 'serviceType');
    const serviceType = this.fhirConstants.SERVICE_TYPES.find(element => element.code === serviceTypeParam?.value?.toString());
    if (serviceType) {
      this.generalInfoServiceTypeForm.controls['serviceType'].patchValue(serviceType);
    }

    // Set Service Type
    const ethnicityParam = parameters.parameter?.find(param => param.name.value == 'ethnicity');
    const ethnicity = this.fhirConstants.ETHNICITY.find(element => element.code === ethnicityParam?.value?.toString());
    if (ethnicity && this.generalInfoServiceTypeForm) {
      this.generalInfoServiceTypeForm.controls['ethnicity'].patchValue(ethnicity);
    }

    // Set Service Type
    const raceParam = parameters.parameter?.find(param => param.name.value == 'race');
    const raceCodes = raceParam?.value?.toString()?.split(',');
    if (raceCodes) {
      const raceCheckboxesSelectedList = this.fhirConstants.RACE_CATEGORIES
        .slice(0, 5)
        .map(element => element.code)
        .map((element) => raceCodes.indexOf(element) != -1);
      this.generalInfoServiceTypeForm.controls['raceCategoriesListCheckboxes'].patchValue(raceCheckboxesSelectedList);
    }

    // When populating the radio buttons we assume that the array of values contains 1 element with value UNK ASKU
    if (raceCodes?.length === 1) {
      const race = this.fhirConstants.RACE_CATEGORIES.find(category => category.code === raceCodes[0]);
      this.generalInfoServiceTypeForm.controls['raceCategoriesListRadioBtns'].patchValue(race);
    }
  }

  onReturn() {
    const requestedStep = 1;
    if(
      this.generalInfoServiceTypeForm.pristine
      ||
      this.serviceRequestHandlerService.deepCompare(this.generalInfoServiceTypeForm.value, this.initialFormValue)){
      this.requestStepEvent.emit(requestedStep);
    }
    else {
      openConformationDialog(
        this.dialog,
        {
          title: "Save Changes",
          content: "Save your current changes?",
          defaultActionBtnTitle: "Save",
          secondaryActionBtnTitle: "Cancel",
          width: "20em",
          height: "12em"
        })
        .subscribe(
          action => {
            if (action == 'secondaryAction') {
              //restore the form to it's initial state
              this.generalInfoServiceTypeForm.reset();
              if(this.parameters && this.parameters?.parameter?.length > 0){
                this.updateFormControlsWithParamsValues(this.parameters);
              }
              else if (this.usCorePatient){
                this.updateFormControlsWithPatientValues(this.usCorePatient);
              }
              this.requestStepEvent.emit(CURRENT_STEP-1);
            }
            else if (action == 'defaultAction') {
              this.onSave(CURRENT_STEP-1);
            }
          }
        )
    }
  }

  onProceed() {
    const requestedStep = CURRENT_STEP + 1;
    if(
       this.generalInfoServiceTypeForm.status === 'VALID'
      &&
      (
        this.generalInfoServiceTypeForm.pristine
        ||
        this.serviceRequestHandlerService.deepCompare(this.generalInfoServiceTypeForm.value, this.initialFormValue))){
      this.requestStepEvent.emit(requestedStep);
    }
    else {
      this.onSave(requestedStep);
    }
  }
}
