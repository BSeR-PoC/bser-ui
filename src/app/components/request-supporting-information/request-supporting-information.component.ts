import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppConstants} from "../../providers/app-constants";
import {Router} from "@angular/router";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";

@Component({
  selector: 'app-request-supporting-information',
  templateUrl: './request-supporting-information.component.html',
  styleUrls: ['./request-supporting-information.component.scss']
})
export class RequestSupportingInformationComponent implements OnInit {

  requestSupportingInformationForm: FormGroup;

  constructor(
    public appConstants: AppConstants,
    private router: Router,
    public fhirConstants: FhirTerminologyConstants,
  ) { }

  ngOnInit(): void {
    this.requestSupportingInformationForm = new FormGroup({
      'height':new FormControl(null, [Validators.required]),
      'weight':new FormControl(null, [Validators.required]),
      'bmi':new FormControl(null, [Validators.required]),
      'bp':new FormControl(null, [Validators.required]),
      'allergies':new FormControl(null, [Validators.required]),
      'medicalHistory':new FormControl(null, [Validators.required]),
      'smokingStatus':new FormControl(null, [Validators.required]),
    });

  }

  onSubmit() {}

  onCancel() {

  }

  onSubmitData() {
    this.onSubmit();
    this.router.navigate(['/'])
  }

}
