import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";

@Component({
  selector: 'app-general-information-and-service-type',
  templateUrl: './general-information-and-service-type.component.html',
  styleUrls: ['./general-information-and-service-type.component.scss']
})
export class GeneralInformationAndServiceTypeComponent implements OnInit {

  generalInformationAndServiceTypeForm: FormGroup;

  constructor(
    public fhirTerminologyConstants: FhirTerminologyConstants
  ) { }

  ngOnInit(): void {
    this.generalInformationAndServiceTypeForm = new FormGroup({
      'height':new FormControl(null, [Validators.required]),
      'weight':new FormControl(null, [Validators.required]),
      'bmi':new FormControl(null, [Validators.required]),
      'bp':new FormControl(null, [Validators.required]),
      'allergies':new FormControl(null, [Validators.required]),
      'medicalHistory':new FormControl(null, [Validators.required]),
    });

  }

  onSubmit() {

  }
}
