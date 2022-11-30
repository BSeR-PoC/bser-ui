import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {ParameterHandlerService} from "../../service/parameter-handler.service";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";
import {UtilsService} from "../../service/utils.service";
import {EnginePostHandlerService} from "../../service/engine-post-handler.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-review-and-send',
  templateUrl: './review-and-send.component.html',
  styleUrls: ['./review-and-send.component.scss']
})
export class ReviewAndSendComponent implements OnInit {

  @Input() selectedServiceProvider: any;

  @Output() returnToEditEvent = new EventEmitter();

  currentSnapshot: ServiceRequest;

  currentParameters: Parameters;

  constructor(
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private parameterHandlerService: ParameterHandlerService,
    private fhirConstants: FhirTerminologyConstants,
    public utilsService: UtilsService,
    private router: Router,
    public enginePostHandler: EnginePostHandlerService
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

  getValueCodeParam(parameters: Parameters,  name: string): any {
      const param = parameters.parameter?.find(param => param.name.value == name);
      if (param){
        if(name === 'educationLevel'){
          return this.fhirConstants.EDUCATION_LEVEL.find(element => element.code === param?.value?.toJSON().value);
        }
        else if (name === 'serviceType'){
          return this.fhirConstants.SERVICE_TYPES.find(element => element.code === param?.value?.toJSON().value);
        }
        else if (name === 'employmentStatus'){
          return this.fhirConstants.EMPLOYMENT_STATUS.find(element => element.code === param?.value?.toJSON().value);
        }
        else if (name === 'ethnicity'){
          return this.fhirConstants.ETHNICITY.find(element => element.code === param?.value?.toJSON().value);
        }
        else if (name === 'race'){
          const raceCodes = param?.value?.toJSON().value?.split(',');
          if (raceCodes) {
            const stringList = this.fhirConstants.RACE_CATEGORIES
              .filter(element => raceCodes.indexOf(element.code) != -1)
              .map(element => element.display);
            const completeString = stringList.join(", ")
            return completeString;
          }
          return "UNKNOWN";
        }
        else if (name === 'bodyHeight') {
          const value = param.value.toJSON()?.value;
          const bodyHeightUnitCode = param.value.toJSON()?.code;
          const unit = this.fhirConstants.HEIGHT_UNITS.find(unit => unit.code === bodyHeightUnitCode)?.display;
          return value + ' ' + unit;
        }
        else if (name === 'bodyWeight') {
          const value = param.value.toJSON()?.value;
          const bodyWeightUnitCode = param.value.toJSON()?.code;
          const unit = this.fhirConstants.WEIGHT_UNITS.find(unit => unit.code === bodyWeightUnitCode)?.display;
          return value + ' ' + unit;
        }
        else if (name === 'bmi') {
          const bmi = param.value.toJSON()?.value;
          const unit = this.fhirConstants.OTHER_UNITS.find(unit => unit.code === "kg/m2")?.display;
          return bmi + ' ' + unit;
        }
        else if (name === 'bloodPressure') {
          const bpDiastolic = param.part.find(param => param.name.value == 'diastolic')?.value?.toJSON()?.value;
          const bpSystolic = param.part.find(param => param.name.value == 'systolic')?.value?.toJSON()?.value;
          return bpSystolic + '/' + bpDiastolic +  ' mmHg'; // TODO: Do not hardcode this
        }
        else if (name === 'ha1c') {
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

  onSendReferral(downloadRequested: boolean) {
    this.enginePostHandler.postToEngine(this.currentSnapshot, this.currentParameters).subscribe({
      next: result => {
        this.utilsService.showSuccessNotification("Referral Send Successfully.")
        if(downloadRequested){
          const bundleReference = result['parameter']?.find(parameter => parameter.name === 'referral_request').valueReference?.reference;
          this.getReferralBundle(bundleReference);
        }
        else {
          this.router.navigate(['/']);
        }
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

  private getReferralBundle(bundleReference: any) {
    this.serviceRequestHandlerService.getReferral(bundleReference).subscribe({
      next: value => {
        const sJson = JSON.stringify(value);
        const element = document.createElement('a');
        element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(sJson));
        element.setAttribute('download', "primer-server-task.json");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click(); // simulate click
        document.body.removeChild(element);
        this.router.navigate(['/']);
      },
      error: err => {
        console.error(err);
        this.utilsService.showErrorNotification();
      }
    })
  }

}
