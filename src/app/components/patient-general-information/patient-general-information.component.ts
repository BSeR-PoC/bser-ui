import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppConstants} from "../../providers/app-constants";

@Component({
  selector: 'app-patient-general-information',
  templateUrl: './patient-general-information.component.html',
  styleUrls: ['./patient-general-information.component.scss']
})
export class PatientGeneralInformationComponent implements OnInit {

  patientGeneralInformationForm: FormGroup;

  constructor(public appConstants: AppConstants) { }

  ngOnInit(): void {
    this.patientGeneralInformationForm = new FormGroup({
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
