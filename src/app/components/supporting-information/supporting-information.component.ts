import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {openConformationDialog} from "../conformation-dialog/conformation-dialog.component";
import {UtilsService} from "../../service/utils.service";
import {MatDialog} from "@angular/material/dialog";
import {mergeMap} from "rxjs";

const CURRENT_STEP = 3;

@Component({
  selector: 'app-supporting-information',
  templateUrl: './supporting-information.component.html',
  styleUrls: ['./supporting-information.component.scss']
})
export class SupportingInformationComponent implements OnInit {

  @Input() selectedServiceProvider: any;

  @Output() savedSuccessEvent = new EventEmitter();
  @Output() requestStepEvent = new EventEmitter();

  readonly DIABETES_PREVENTION = "diabetes-prevention";

  supportingInformationForm: UntypedFormGroup;
  parameters: Parameters;

  private serviceRequest: ServiceRequest;
  private initialFormValue: any;

  serviceType: string;

  constructor(
    private router: Router,
    public fhirConstants: FhirTerminologyConstants,
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private dialog: MatDialog,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {

    this.serviceRequestHandlerService.currentSnapshot$.pipe(
      mergeMap(value=> {
        this.serviceRequest = value;
        this.initForm(this.serviceRequest);
        return this.serviceRequestHandlerService.currentParameters$
      })
    ).subscribe({
      next: value => {
        this.parameters = value;
        if (this.parameters) {
          this.serviceType = this.parameters?.parameter?.find(param=> param?.name?.value == 'serviceType')?.value?.['value'];

          if(this.serviceType == this.DIABETES_PREVENTION){
            const ha1c =  new  UntypedFormControl(null, [Validators.required]);
            this.supportingInformationForm.addControl('ha1c', ha1c);
          }
          else if(this.supportingInformationForm.controls['ha1c']){
            this.supportingInformationForm.removeControl('ha1c');
          }

          this.updateFormControlsWithParamsValues(this.parameters);
        }
        this.initialFormValue = this.serviceRequestHandlerService.deepCopy(this.supportingInformationForm.value);
      }
    });
  }

  private initForm(serviceRequest: ServiceRequest) {
    // TODO the content of this form will change based on the service request. We need to be able to track the changes somehow.
    const heightValue = new UntypedFormControl(null, [Validators.required]);
    const heightUnit = new UntypedFormControl(this.fhirConstants.HEIGHT_UNITS[1], [Validators.required]);
    const weightValue =  new  UntypedFormControl(null, [Validators.required]);
    const weightUnit =  new  UntypedFormControl(this.fhirConstants.WEIGHT_UNITS[1], [Validators.required]);
    const bmi =  new  UntypedFormControl(null, [Validators.required]);
    const bpDiastolic =  new  UntypedFormControl(null, [Validators.required]);
    const bpSystolic =  new  UntypedFormControl(null, [Validators.required]);

    // const smokingStatus =  new  FormControl(null, [Validators.required]);
    // const allergies =  new  FormControl(null);
    // const medicalHistory =  new  FormControl(null);

    //TODO init a form based on the service request, additionally as the service3 request is modified, we need to change the form fields dynamically.
    this.supportingInformationForm = new UntypedFormGroup({
      heightValue, heightUnit, weightValue, weightUnit, bmi, bpDiastolic, bpSystolic
    });

    if(this.serviceType == this.DIABETES_PREVENTION){
      const ha1c =  new  UntypedFormControl(null, [Validators.required]);
      this.supportingInformationForm.addControl('ha1c', ha1c);
    }
  }

  onCancel() {
    if(!this.serviceRequestHandlerService.deepCompare(this.supportingInformationForm.value, this.initialFormValue)){
      this.router.navigate(['/']);
    }
    else {
      openConformationDialog(
        this.dialog,
        {
          title: "Submit",
          content: "Save your changes and submit the referral?",
          defaultActionBtnTitle: "Submit",
          secondaryActionBtnTitle: "Cancel",
          width: "20em",
          height: "12em"
        })
        .subscribe(
          action => {
            if (action == 'rejected') {
              this.supportingInformationForm.reset();
              if(this.parameters){
                this.updateFormControlsWithParamsValues(this.parameters)
              }
              this.router.navigate(['/']);
            }
            else if (action == 'confirmed') {
              this.onSave(CURRENT_STEP + 1);
            }
            this.supportingInformationForm.reset();
          }
        )
    }
  }
  onSave(requestedStep?: number) {
    this.supportingInformationForm.markAllAsTouched();
    if(this.supportingInformationForm.status === 'VALID') {
      const formData = this.getFormData(this.supportingInformationForm);
      this.savedSuccessEvent.emit({ requestedStep: requestedStep, data: formData });
    }
  }

  private getFormData(form: UntypedFormGroup) {
    //TODO the data we gather will depend on the selected service.
    const heightValue = form.controls['heightValue'].value;
    const heightUnit = form.controls['heightUnit'].value;
    const weightValue = form.controls['weightValue'].value;
    const weightUnit = form.controls['weightUnit'].value;
    const bmi = form.controls['bmi'].value;
    const bpDiastolic = form.controls['bpDiastolic'].value;
    const bpSystolic = form.controls['bpSystolic'].value;

    // const smokingStatus = form.controls['smokingStatus'].value;
    // const allergies = form.controls['allergies'].value;
    // const medicalHistory = form.controls['medicalHistory'].value;

    let emitterData = {
      height: {value: heightValue, unit: heightUnit},
      weight: {value: weightValue, unit: weightUnit},
      bmi: {value: bmi, unit: "kg/m2"},
      bp: { bpDiastolic: { name: 'diastolic', value: bpDiastolic }, bpSystolic : { name: 'systolic', value: bpSystolic }},
      // smokingStatus: smokingStatus,
      // allergies: allergies,
      // medicalHistory: medicalHistory,
    }

    if(this.serviceType == this.DIABETES_PREVENTION){
      emitterData['ha1c'] = {value: form.controls['ha1c'].value, unit: "%"};
    }

    return emitterData;
  }


  private updateFormControlsWithParamsValues(parameters: Parameters) {

    const bmiParam = parameters.parameter.find(param => param.name.value == 'bmi');
    if (bmiParam) {
      const bmi = bmiParam.value.toJSON()?.value;
      this.supportingInformationForm.controls['bmi'].patchValue(bmi);
    }

    const bloodPressureParam = parameters.parameter.find(param => param.name.value == 'bloodPressure');
    if(bloodPressureParam){
      const bpDiastolic = bloodPressureParam.part.find(param => param.name.value == 'diastolic');
      if(bpDiastolic){
        const bpDiastolicValue = bpDiastolic.value.toJSON()?.value;
        this.supportingInformationForm.controls['bpDiastolic'].patchValue(bpDiastolicValue);
      }

      const bpSystolic = bloodPressureParam.part.find(param => param.name.value == 'systolic');
      if(bpSystolic){
        const bpSystolicValue = bpSystolic.value.toJSON()?.value;
        this.supportingInformationForm.controls['bpSystolic'].patchValue(bpSystolicValue);
      }
    }

    const bodyWeightParam = parameters.parameter.find(param => param.name.value == 'bodyWeight');
    if (bodyWeightParam) {
      const bodyWeightValue = bodyWeightParam.value.toJSON()?.value;
      this.supportingInformationForm.controls['weightValue'].patchValue(bodyWeightValue);

      const bodyWeightUnitValue = bodyWeightParam.value.toJSON()?.unit;
      const bodyWeight = this.fhirConstants.WEIGHT_UNITS.find(unit => unit.display === bodyWeightUnitValue)
      this.supportingInformationForm.controls['weightUnit'].patchValue(bodyWeight);
    }

    const bodyHeightParam = parameters.parameter.find(param => param.name.value == 'bodyHeight');
    if (bodyHeightParam) {
      const bodyHeightValue = bodyHeightParam.value.toJSON()?.value;
      this.supportingInformationForm.controls['heightValue'].patchValue(bodyHeightValue);

      const bodyHeightUnitValue = bodyHeightParam.value.toJSON()?.unit;
      const bodyHeightUnit = this.fhirConstants.HEIGHT_UNITS.find(unit => unit.display === bodyHeightUnitValue)
      this.supportingInformationForm.controls['heightUnit'].patchValue(bodyHeightUnit);
    }

    if(this.serviceType == this.DIABETES_PREVENTION){
      const ha1cParam = parameters.parameter.find(param => param.name.value == 'ha1c');
      if (ha1cParam) {
        const ha1cValue = ha1cParam.value.toJSON()?.value;
        this.supportingInformationForm.controls['ha1c'].patchValue(ha1cValue);
      }
    }
    console.log(this.supportingInformationForm);

  }

  onReturn() {
    if(
      this.supportingInformationForm.pristine
      ||
      this.serviceRequestHandlerService.deepCompare(this.supportingInformationForm.value, this.initialFormValue)){
      this.utilsService.resetFormErrors(this.supportingInformationForm);
      this.requestStepEvent.emit(CURRENT_STEP -1);
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
              this.supportingInformationForm.reset();
              this.utilsService.resetFormErrors(this.supportingInformationForm);
              if(this.parameters && this.parameters?.parameter?.length > 0){
                this.updateFormControlsWithParamsValues(this.parameters);
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
    if(
      this.supportingInformationForm.status === 'VALID'
      &&
      (
        this.supportingInformationForm.pristine
        ||
        this.serviceRequestHandlerService.deepCompare(this.supportingInformationForm.value, this.initialFormValue))){
      this.requestStepEvent.emit(CURRENT_STEP + 1);
    }
    else {
      this.onSave(CURRENT_STEP + 1);
    }
  }
}
