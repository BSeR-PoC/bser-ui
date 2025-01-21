import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";
import {UtilsService} from "../../service/utils.service";
import {EnginePostHandlerService} from "../../service/engine-post-handler.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-review-and-send',
    templateUrl: './review-and-send.component.html',
    styleUrls: ['./review-and-send.component.scss'],
    standalone: false
})
export class ReviewAndSendComponent implements OnChanges {

  @Input() selectedServiceProvider: any;

  @Output() returnToEditEvent = new EventEmitter();
  educationLevel: string;
  serviceType: string;
  employmentStatus: string;
  ethnicity: string;
  bodyHeight: string;
  bodyWeight: string;
  bmi: string;
  bloodPressure: string;
  ha1c: string;
  race: string;

  @Input() serviceRequest: ServiceRequest;
  @Input() parameters: Parameters;

  constructor(
    private fhirConstants: FhirTerminologyConstants,
    public utilsService: UtilsService,
    private router: Router,
    public enginePostHandler: EnginePostHandlerService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['parameters']?.currentValue) {
      this.educationLevel = this.getValueCodeParam(this.parameters, 'educationLevel');
      this.serviceType = this.getValueCodeParam(this.parameters, 'serviceType');
      this.employmentStatus = this.getValueCodeParam(this.parameters, 'employmentStatus');
      this.ethnicity = this.getValueCodeParam(this.parameters, 'ethnicity');
      this.race = this.getValueCodeParam(this.parameters, 'race');
      this.bodyHeight = this.getValueCodeParam(this.parameters, 'bodyHeight');
      this.bodyWeight = this.getValueCodeParam(this.parameters, 'bodyWeight');
      this.bmi = this.getValueCodeParam(this.parameters, 'bmi');
      this.bloodPressure = this.getValueCodeParam(this.parameters, 'bloodPressure');
      this.ha1c = this.getValueCodeParam(this.parameters, 'ha1c');
    }
  }

  getValueCodeParam(parameters: Parameters, name: string): string {
    const param = parameters?.parameter?.find(param => param.name.value == name);
    if (param) {
      if (name === 'educationLevel') {
        return this.fhirConstants.EDUCATION_LEVEL.find(element => element.code === param?.value?.toJSON().value)?.display;
      } else if (name === 'serviceType') {
        return this.fhirConstants.SERVICE_TYPES.find(element => element.code === param?.value?.toJSON().value)?.display;
      } else if (name === 'employmentStatus') {
        return this.fhirConstants.EMPLOYMENT_STATUS.find(element => element.code === param?.value?.toJSON().value)?.display;
      } else if (name === 'ethnicity') {
        return this.fhirConstants.ETHNICITY.find(element => element.code === param?.value?.toJSON().value)?.display;
      } else if (name === 'race') {
        const raceCodes = param?.value?.toJSON().value?.split(',');
        if (raceCodes) {
          const stringList = this.fhirConstants.RACE_CATEGORIES
            .filter(element => raceCodes.indexOf(element.code) != -1)
            .map(element => element.display);
          const completeString = stringList.join(", ")
          return completeString;
        }
        return "UNKNOWN";
      } else if (name === 'bodyHeight') {
        const value = param.value.toJSON()?.value;
        const bodyHeightUnitCode = param.value.toJSON()?.code;
        const unit = this.fhirConstants.HEIGHT_UNITS.find(unit => unit.code === bodyHeightUnitCode)?.display;
        return value + ' ' + unit;
      } else if (name === 'bodyWeight') {
        const value = param.value.toJSON()?.value;
        const bodyWeightUnitCode = param.value.toJSON()?.code;
        const unit = this.fhirConstants.WEIGHT_UNITS.find(unit => unit.code === bodyWeightUnitCode)?.display;
        return value + ' ' + unit;
      } else if (name === 'bmi') {
        const bmi = param.value.toJSON()?.value;
        const unit = this.fhirConstants.OTHER_UNITS.find(unit => unit.code === "kg/m2")?.display;
        return bmi + ' ' + unit;
      } else if (name === 'bloodPressure') {
        const bpDiastolic = param.part.find(param => param.name.value == 'diastolic')?.value?.toJSON()?.value;
        const bpSystolic = param.part.find(param => param.name.value == 'systolic')?.value?.toJSON()?.value;
        return bpSystolic + '/' + bpDiastolic + ' mmHg'; // TODO: Do not hardcode this
      } else if (name === 'ha1c') {
        const value = param.value.toJSON()?.value;
        const ha1cUnitCode = param.value.toJSON()?.unit;
        return value + ' ' + ha1cUnitCode;
      }

      return "UNKNOWN";
    }
    return "UNKNOWN";
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  onSendReferral() {
    this.enginePostHandler.postToEngine(this.serviceRequest, this.parameters).subscribe({
      next: result => {
        this.utilsService.showSuccessNotification("Referral Send Successfully.")
        this.router.navigate(['/']);
      },
      error: err => {
        console.error(err);
        this.utilsService.showErrorNotification(err?.message?.toString());
      }
    })
  }

  onReturn() {
    const requestedStep = 1;
    this.returnToEditEvent.emit(requestedStep);
  }
}
