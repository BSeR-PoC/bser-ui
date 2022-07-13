import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppConstants} from "../../providers/app-constants";

@Component({
  selector: 'app-request-supporting-information',
  templateUrl: './request-supporting-information.component.html',
  styleUrls: ['./request-supporting-information.component.scss']
})
export class RequestSupportingInformationComponent implements OnInit {

  requestSupportingInformationForm: FormGroup;

  constructor(
    public appConstants: AppConstants,
  ) { }

  ngOnInit(): void {
    this.requestSupportingInformationForm = new FormGroup({
      'height':new FormControl(null, [Validators.required]),
      'weight':new FormControl(null, [Validators.required]),
      'bmi':new FormControl(null, [Validators.required]),
      'bp':new FormControl(null, [Validators.required]),
      'allergies':new FormControl(null, [Validators.required]),
      'medicalHistory':new FormControl(null, [Validators.required]),
    });

  }

  onSubmit() {}

}
