import {Component, Input, OnInit} from '@angular/core';
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {ParameterHandlerService} from "../../service/parameter-handler.service";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";
import {UtilsService} from "../../service/utils.service";
import {ActivatedRoute, Router} from "@angular/router";

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
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private parameterHandlerService: ParameterHandlerService,
    private fhirTerminologyConstants: FhirTerminologyConstants,
    public utilsService: UtilsService,
    private router: Router,
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
          return this.fhirTerminologyConstants.EDUCATION_LEVEL.find(element => element.code === param?.value?.toJSON().value);
        }
        else if (name === 'serviceType'){
          return this.fhirTerminologyConstants.SERVICE_TYPES.find(element => element.code === param?.value?.toJSON().value);
        }
        else if (name === 'employmentStatus'){
          return this.fhirTerminologyConstants.EMPLOYMENT_STATUS.find(element => element.code === param?.value?.toJSON().value);
        }
        else if (name === 'ethnicity'){
          return this.fhirTerminologyConstants.ETHNICITY.find(element => element.code === param?.value?.toJSON().value);
        }
        else if (name === 'race'){
          const raceCodes = param?.value?.toJSON().value?.split(',');
          if (raceCodes) {
            const stringList = this.fhirTerminologyConstants.RACE_CATEGORIES
              .filter(element => raceCodes.indexOf(element.code) != -1)
              .map(element => element.display);
            return stringList;
          }
          return "UNKNOWN";
        }
        else if (name === 'bodyHeight') {
          const value = param.value.toJSON()?.value;
          const unit = param.value.toJSON()?.unit;
          return value + ' ' + unit;
        }
        else if (name === 'bodyWeight') {
          const value = param.value.toJSON()?.value;
          const unit = param.value.toJSON()?.unit;
          return value + ' ' + unit;
        }
        else if (name === 'bmi') {
          const bmi = param.value.toJSON()?.value;
          return bmi;
        }
        else if (name === 'bloodPressure') {
          const bpDiastolic = param.part.find(param => param.name.value == 'diastolic')?.value?.toJSON()?.value;
          const bpSystolic = param.part.find(param => param.name.value == 'systolic')?.value?.toJSON()?.value;
          return bpSystolic + '/' + bpDiastolic +  ' mmHg';
        }
        return "UNKNOWN";
      }
      return "UNKNOWN";
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  onSendReferral() {
    console.log("on send referral");
  }
}
