import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppConstants} from "../../providers/app-constants";
import {Router} from "@angular/router";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";

@Component({
  selector: 'app-supporting-information',
  templateUrl: './supporting-information.component.html',
  styleUrls: ['./supporting-information.component.scss']
})
export class SupportingInformationComponent implements OnInit, OnChanges {

  @Input() serviceRequest: any;
  @Input() selectedServiceProvider: any;
  @Input() params: Parameters;

  @Output() savedSuccessEvent = new EventEmitter();

  supportingInformationForm: FormGroup;

  constructor(
    public appConstants: AppConstants,
    private router: Router,
    public fhirConstants: FhirTerminologyConstants,
  ) { }

  ngOnInit(): void {
    this.initForm(this.serviceRequest);
  }

  private initForm(serviceRequest) {
    // TODO the content of this form will change based on the service request. We need to be able to track the changes somehow.
    const heightValue = new FormControl(null, [Validators.required]);
    const heightUnit = new FormControl(null, [Validators.required]);
    const weightValue =  new  FormControl(null, [Validators.required]);
    const weightUnit =  new  FormControl(null, [Validators.required]);
    const bmi =  new  FormControl(null, [Validators.required]);
    const bpDiastolic =  new  FormControl(null, [Validators.required]);
    const bpSystolic =  new  FormControl(null, [Validators.required]);
    // const smokingStatus =  new  FormControl(null, [Validators.required]);
    // const allergies =  new  FormControl(null);
    // const medicalHistory =  new  FormControl(null);

    //TODO init a form based on the service request, additionally as the service3 request is modified, we need to change the form fields dynamically.
    this.supportingInformationForm = new FormGroup({
      heightValue, heightUnit, weightValue, weightUnit, bmi, bpDiastolic, bpSystolic
    });
  }

  onCancel() {
    //TODO check for changes and execute cancel.
  }

  onSave(advanceRequested: boolean) {
    this.supportingInformationForm.markAllAsTouched();
    if(this.supportingInformationForm.status === 'VALID') {
      const formData = this.getFormData(this.supportingInformationForm);
      this.savedSuccessEvent.emit({ advanceRequested: advanceRequested, data: formData });
    }
  }

  private getFormData(form: FormGroup) {
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

    const emitterData = {
      height: {value: heightValue, unit: heightUnit},
      weight: {value: weightValue, unit: weightUnit},
      bmi: {value: bmi, unit: "kg/m^2"},
      bp: { bpDiastolic: { name: 'diastolic', value: bpDiastolic }, bpSystolic : { name: 'systolic', value: bpSystolic }}
      // smokingStatus: smokingStatus,
      // allergies: allergies,
      // medicalHistory: medicalHistory,
    }

    return emitterData;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.['params']?.currentValue?.parameter){

    }
    console.log(changes?.['params']?.currentValue?.parameter);
  }


}
